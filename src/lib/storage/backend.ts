/**
 * The narrow synchronous key-value contract the storage layer needs. Every
 * engine below satisfies it, so nothing above this file knows which one it got.
 */
export interface KeyValueStore {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  remove(key: string): void;
}

/** Shape of the bit of `react-native-mmkv` we use, so the require can be typed. */
interface MMKVModule {
  createMMKV(config: { id: string }): KeyValueStore;
}

/** Shape of the bit of `expo-file-system` we use. */
interface FileSystemModule {
  File: new (
    directory: unknown,
    name: string,
  ) => {
    exists: boolean;
    textSync(): string;
    write(contents: string): void;
    create(): void;
  };
  Paths: { document: unknown };
}

/**
 * MMKV v4 runs on Nitro Modules, which is a **native** module. Expo Go ships a
 * fixed set of native modules and Nitro is not among them, so `createMMKV`
 * throws there — "Failed to get NitroModules" — as soon as the module loads.
 *
 * That is less a bug to work around than a fact about Expo Go: any library with
 * its own native code needs a development build. Until one exists, the app
 * still has to run.
 *
 * `require` rather than a static `import`, because a static import evaluates
 * the native module before any `try` could catch it.
 */
function tryMMKV(id: string): KeyValueStore | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mmkv = require('react-native-mmkv') as MMKVModule;
    const store = mmkv.createMMKV({ id });
    // Touch it once: some failures surface on first access rather than on
    // construction, and finding out now beats finding out mid-onboarding.
    store.getString('__probe__');
    return store;
  } catch {
    return null;
  }
}

/**
 * One JSON file in the document directory, read once into memory and written
 * through on every change.
 *
 * `expo-file-system` is already a dependency, ships inside Expo Go, and its
 * `textSync`/`write` are genuinely synchronous — which is the whole reason this
 * layer exists. Six onboarding answers make the read-modify-write cost
 * irrelevant, and it buys persistence across a reload rather than quietly
 * losing her answers.
 */
function tryFile(id: string): KeyValueStore | null {
  let file: InstanceType<FileSystemModule['File']> | null = null;
  let cache: Record<string, string> = {};

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('expo-file-system') as FileSystemModule;
    file = new fs.File(fs.Paths.document, `${id}.json`);
    if (file.exists) {
      cache = JSON.parse(file.textSync()) as Record<string, string>;
    }
  } catch {
    // No document directory at all — this is the server-side render pass that
    // Expo Router runs in Node to produce static web output. There is no device
    // storage there and nothing to persist, so hand back to the caller.
    return null;
  }

  const handle = file;
  const flush = () => {
    try {
      if (!handle.exists) {
        handle.create();
      }
      handle.write(JSON.stringify(cache));
    } catch {
      // A full disk, a sandbox quirk. The in-memory copy is still correct for
      // this session, so the flow continues and only the resume-after-kill
      // guarantee is lost. Better than throwing out of a tap handler.
    }
  };

  return {
    getString: (key) => cache[key],
    set: (key, value) => {
      cache[key] = value;
      flush();
    },
    remove: (key) => {
      delete cache[key];
      flush();
    },
  };
}

/**
 * The floor. Nothing persists, but nothing throws either.
 *
 * This is what the static web render gets, and it is the right answer there:
 * that pass produces HTML in Node and has no user, no device and no session to
 * remember. It would also catch a device where both engines above failed, where
 * a working flow beats a crash on the first question.
 */
function memoryStore(): KeyValueStore {
  const cache = new Map<string, string>();
  return {
    getString: (key) => cache.get(key),
    set: (key, value) => void cache.set(key, value),
    remove: (key) => void cache.delete(key),
  };
}

/**
 * Which engine actually got used. Worth surfacing: the three differ in where
 * the data lives and whether it survives a kill, so a bug report that does not
 * say which one is missing half the story.
 */
export type StorageEngine = 'mmkv' | 'file' | 'memory';

export interface OpenedStore {
  store: KeyValueStore;
  engine: StorageEngine;
}

/**
 * Picks the best engine available, in order: MMKV on a development or
 * production build, a JSON file in Expo Go, memory during a static render.
 */
export function openStore(id: string): OpenedStore {
  const mmkv = tryMMKV(id);
  if (mmkv) {
    return { store: mmkv, engine: 'mmkv' };
  }

  const file = tryFile(id);
  if (file) {
    return { store: file, engine: 'file' };
  }

  return { store: memoryStore(), engine: 'memory' };
}
