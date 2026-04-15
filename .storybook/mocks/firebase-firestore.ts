// Mock firebase/firestore for Storybook — prevents Firestore initialization

export function getFirestore() {
  return {};
}

export function collection() {
  return {};
}

export function doc() {
  return {};
}

export function getDoc() {
  return Promise.resolve({ exists: () => false, data: () => null });
}

export function getDocs() {
  return Promise.resolve({ docs: [], empty: true, size: 0 });
}

export function setDoc() {
  return Promise.resolve();
}

export function updateDoc() {
  return Promise.resolve();
}

export function deleteDoc() {
  return Promise.resolve();
}

export function query() {
  return {};
}

export function where() {
  return {};
}

export function orderBy() {
  return {};
}

export function limit() {
  return {};
}

export function onSnapshot(_ref: any, callback: any) {
  callback({ docs: [], empty: true, size: 0 });
  return () => {};
}
