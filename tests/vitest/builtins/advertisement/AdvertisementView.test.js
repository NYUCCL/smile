/* eslint-disable import/no-unresolved */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import Advertisement from '@/builtins/advertisement/AdvertisementView.vue'

// Mock API with goNextView method
const mockGoNextView = vi.fn()
const mockPreloadAllImages = vi.fn()
const mockPreloadAllVideos = vi.fn()

vi.mock('@/core/composables/useViewAPI', () => ({
  default: () => ({
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    goNextView: mockGoNextView,
    preloadAllImages: mockPreloadAllImages,
    preloadAllVideos: mockPreloadAllVideos,
    config: {
      windowsizerRequest: {
        width: 1000,
        height: 1000,
      },
      responsiveUI: true,
    },
  }),
}))

let pinia

describe('Advertisement tests', () => {
  beforeEach(() => {
    pinia = createTestingPinia({ stubActions: true })
    setActivePinia(pinia)
    // Clear mock calls between tests
    mockGoNextView.mockClear()
    mockPreloadAllImages.mockClear()
    mockPreloadAllVideos.mockClear()
  })

  it('should render', async () => {
    const wrapper = mount(Advertisement, {
      global: {
        plugins: [pinia],
        stubs: ['FAIcon'],
      },
    })
    await new Promise((r) => setTimeout(r, 200)) // wait for db connection
    expect(wrapper.html()).toContain('Please help us')
  })

  it('should call goNextView when button is clicked', async () => {
    const wrapper = mount(Advertisement, {
      global: {
        plugins: [pinia],
        stubs: ['FAIcon'],
      },
    })

    // Find and click the button
    const button = wrapper.find('#begintask')
    await button.trigger('click')

    // Verify goNextView was called
    expect(mockGoNextView).toHaveBeenCalledTimes(1)
  })
})
