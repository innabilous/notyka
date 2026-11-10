import { EditorSettings, ProjectItem } from '@/types/storage.types';
import { EditorSettingsSchema } from '@/schemas/editor-settings.schema';
import { ProjectItemSchema } from '@/schemas/project.schema';

const SETTINGS_KEY = 'notyka_editor_settings';
const DB_NAME = 'notyka_db';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_SESSION = 'session';

export function saveSettings(settings: EditorSettings): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
	} catch (e) {
		console.warn('Failed to save settings to localStorage:', e);
	}
}

export function loadSettings(): EditorSettings | null {
	if (typeof window === 'undefined') return null;
	try {
		const raw = localStorage.getItem(SETTINGS_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		const result = EditorSettingsSchema.safeParse(parsed);
		if (result.success) {
			return result.data;
		}
		console.warn('Invalid settings schema in localStorage, using defaults');
		return null;
	} catch (e) {
		console.warn('Failed to load settings from localStorage:', e);
		return null;
	}
}

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		if (typeof window === 'undefined' || !window.indexedDB) {
			reject(new Error('IndexedDB not supported'));
			return;
		}

		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
				const store = db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
				store.createIndex('updatedAt', 'updatedAt', { unique: false });
			}
			if (!db.objectStoreNames.contains(STORE_SESSION)) {
				db.createObjectStore(STORE_SESSION, { keyPath: 'id' });
			}
		};

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

export async function saveCurrentSession(project: ProjectItem): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_SESSION, 'readwrite');
		const store = tx.objectStore(STORE_SESSION);
		const req = store.put({ ...project, id: 'current' });

		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}

export async function loadCurrentSession(): Promise<ProjectItem | null> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_SESSION, 'readonly');
		const store = tx.objectStore(STORE_SESSION);
		const req = store.get('current');

		req.onsuccess = () => {
			if (!req.result) {
				resolve(null);
				return;
			}
			const result = ProjectItemSchema.safeParse(req.result);
			resolve(result.success ? result.data : null);
		};
		req.onerror = () => reject(req.error);
	});
}

export async function saveProject(project: ProjectItem): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_PROJECTS, 'readwrite');
		const store = tx.objectStore(STORE_PROJECTS);
		const req = store.put(project);

		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}

export async function getProjectsList(): Promise<ProjectItem[]> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_PROJECTS, 'readonly');
		const store = tx.objectStore(STORE_PROJECTS);
		const index = store.index('updatedAt');
		const req = index.openCursor(null, 'prev');
		const results: ProjectItem[] = [];

		req.onsuccess = (event) => {
			const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
			if (cursor) {
				const validation = ProjectItemSchema.safeParse(cursor.value);
				if (validation.success) {
					results.push(validation.data);
				}
				cursor.continue();
			} else {
				resolve(results);
			}
		};

		req.onerror = () => reject(req.error);
	});
}

export async function deleteProject(id: string): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_PROJECTS, 'readwrite');
		const store = tx.objectStore(STORE_PROJECTS);
		const req = store.delete(id);

		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}

export async function clearAllStorage(): Promise<void> {
	if (typeof window !== 'undefined') {
		localStorage.removeItem(SETTINGS_KEY);
	}
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction([STORE_PROJECTS, STORE_SESSION], 'readwrite');
		tx.objectStore(STORE_PROJECTS).clear();
		tx.objectStore(STORE_SESSION).clear();

		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}
