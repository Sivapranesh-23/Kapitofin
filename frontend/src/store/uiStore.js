import { create } from 'zustand'

const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  darkMode: localStorage.getItem('darkMode') === 'true',

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleDarkMode: () => {
    const next = !useUIStore.getState().darkMode
    localStorage.setItem('darkMode', next)
    if (next) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    set({ darkMode: next })
  },

  // Initialize dark mode from localStorage on load
  initDarkMode: () => {
    if (localStorage.getItem('darkMode') === 'true') {
      document.documentElement.classList.add('dark')
    }
  },
}))

export default useUIStore
