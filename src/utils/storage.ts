import { EditorSettings, ProjectItem } from '@/types/storage';

const DB_NAME = 'notyka_db';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_SESSION = 'session';
const SETTINGS_KEY = 'notyka_editor_settings';
const MAX_PROJECTS = 50;

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		if (typeof window === 'undefined' || !window.indexedDB) {
			return reject(new Error('IndexedDB not supported'));
		}
		const request = window.indexedDB.open(DB_NAME, DB_VERSION);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
				db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
			}
			if (!db.objectStoreNames.contains(STORE_SESSION)) {
				db.createObjectStore(STORE_SESSION, { keyPath: 'id' });
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

export function saveSettings(settings: EditorSettings): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
	} catch {
		// Ignore local storage quota
	}
}

export function loadSettings(): EditorSettings | null {
	if (typeof window === 'undefined') return null;
	try {
		const raw = localStorage.getItem(SETTINGS_KEY);
		return raw ? (JSON.parse(raw) as EditorSettings) : null;
	} catch {
		return null;
	}
}

export async function saveCurrentSession(session: ProjectItem): Promise<void> {
	try {
		const db = await openDB();
		const tx = db.transaction(STORE_SESSION, 'readwrite');
		const store = tx.objectStore(STORE_SESSION);
		store.put({ ...session, id: 'active_session' });
		return new Promise((resolve, reject) => {
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} catch {
		// Ignore storage error
	}
}

export async function loadCurrentSession(): Promise<ProjectItem | null> {
	try {
		const db = await openDB();
		const tx = db.transaction(STORE_SESSION, 'readonly');
		const store = tx.objectStore(STORE_SESSION);
		const request = store.get('active_session');
		return new Promise((resolve) => {
			request.onsuccess = () => {
				const res = request.result as ProjectItem | undefined;
				resolve(res ?? null);
			};
			request.onerror = () => resolve(null);
		});
	} catch {
		return null;
	}
}

export async function clearCurrentSession(): Promise<void> {
	try {
		const db = await openDB();
		const tx = db.transaction(STORE_SESSION, 'readwrite');
		const store = tx.objectStore(STORE_SESSION);
		store.delete('active_session');
	} catch {
		// Ignore
	}
}

export async function saveProject(project: ProjectItem): Promise<void> {
	try {
		const db = await openDB();
		const tx = db.transaction(STORE_PROJECTS, 'readwrite');
		const store = tx.objectStore(STORE_PROJECTS);
		store.put(project);

		// Prune projects exceeding MAX_PROJECTS
		const getAllReq = store.getAll();
		getAllReq.onsuccess = () => {
			const all = (getAllReq.result as ProjectItem[]) || [];
			if (all.length > MAX_PROJECTS) {
				all.sort((a, b) => b.updatedAt - a.updatedAt);
				const toDelete = all.slice(MAX_PROJECTS);
				toDelete.forEach((item) => store.delete(item.id));
			}
		};

		return new Promise((resolve, reject) => {
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} catch {
		// Ignore
	}
}

export async function getProjectsList(): Promise<ProjectItem[]> {
	try {
		const db = await openDB();
		const tx = db.transaction(STORE_PROJECTS, 'readonly');
		const store = tx.objectStore(STORE_PROJECTS);
		const request = store.getAll();
		return new Promise((resolve) => {
			request.onsuccess = () => {
				const list = (request.result as ProjectItem[]) || [];
				list.sort((a, b) => b.updatedAt - a.updatedAt);
				resolve(list);
			};
			request.onerror = () => resolve([]);
		});
	} catch {
		return [];
	}
}

export async function deleteProject(id: string): Promise<void> {
	try {
		const db = await openDB();
		const tx = db.transaction(STORE_PROJECTS, 'readwrite');
		const store = tx.objectStore(STORE_PROJECTS);
		store.delete(id);
		return new Promise((resolve, reject) => {
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} catch {
		// Ignore
	}
}
