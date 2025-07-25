import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LoadingState from '~/components/LoadingState.vue';

describe('LoadingState', () => {
  it('renders with default props', () => {
    const wrapper = mount(LoadingState);
    
    expect(wrapper.text()).toContain('加载中...');
    expect(wrapper.find('.text-8xl').exists()).toBe(true);
  });

  it('renders with custom message', () => {
    const wrapper = mount(LoadingState, {
      props: {
        message: '正在处理...'
      }
    });
    
    expect(wrapper.text()).toContain('正在处理...');
  });

  it('renders with different sizes', () => {
    const wrapperSm = mount(LoadingState, {
      props: { size: 'sm' }
    });
    
    const wrapperLg = mount(LoadingState, {
      props: { size: 'lg' }
    });
    
    expect(wrapperSm.find('.text-4xl').exists()).toBe(true);
    expect(wrapperLg.find('.text-12xl').exists()).toBe(true);
  });
});
