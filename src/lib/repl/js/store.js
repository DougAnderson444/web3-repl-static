import { writable } from 'svelte/store'

export const components = writable(null)
export const currentID = writable(0)
export const currentIndex = writable(0)
