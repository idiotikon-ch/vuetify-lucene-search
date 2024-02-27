import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import BooleanFilter from '../components/BooleanFilter.vue'
import EnumFilter from '../components/EnumFilter.vue'
import Filter from '../components/Filter.vue'
import NumberFilter from '../components/NumberFilter.vue'
import NumberRangeFilter from '../components/NumberRangeFilter.vue'
import Panel from '../components/Panel.vue'
import StringFilter from '../components/StringFilter.vue'
import type { FilterField } from '../types'
import * as testValues from './test-values'
import { nextTick } from 'vue'

const vuetify = createVuetify({
  components,
  directives
})

describe('Panel.vue', () => {
  async function getPanelWrapper(query: string) {
    const wrapper = mount(Panel, {
      props: { fields: testValues.fields, modelValue: query, negative: true },
      global: {
        plugins: [vuetify]
      }
    })
    await nextTick()
    return wrapper
  }

  // String filters

  it('renders string filters', async () => {
    const wrapper = await getPanelWrapper(`string-field:hello`)
    const filterComponent = wrapper.findComponent(StringFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputElement = filterComponent.find('input').element as HTMLInputElement
    expect(inputElement.value).toBe('hello')
  })

  it('renders string filters with multi-word values', async () => {
    const wrapper = await getPanelWrapper(`string-field:"hello world"`)
    const filterComponent = wrapper.findComponent(StringFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputElement = filterComponent.find('input').element as HTMLInputElement
    expect(inputElement.value).toBe('hello world')
  })

  it('renders string filters with empty values', async () => {
    const wrapper = await getPanelWrapper(`string-field:""`)
    const filterComponent = wrapper.findComponent(StringFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputElement = filterComponent.find('input').element as HTMLInputElement
    expect(inputElement.value).toBe('')
  })

  it('renders implicit field filters', async () => {
    const wrapper = await getPanelWrapper('hello')
    const filterComponent = wrapper.findComponent(StringFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputElement = filterComponent.find('input').element as HTMLInputElement
    expect(inputElement.value).toBe('hello')
  })

  // Number filters

  it('renders integer filters', async () => {
    const wrapper = await getPanelWrapper(`integer-field:3`)
    const filterComponent = wrapper.findComponent(NumberFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputElement = filterComponent.find('input').element as HTMLInputElement
    expect(inputElement.value).toBe('3')
  })

  it('renders integer filters with out of range values', async () => {
    const wrapper = await getPanelWrapper(`integer-field:123`)
    const filterComponent = wrapper.findComponent(NumberFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputElement = filterComponent.find('input').element as HTMLInputElement
    expect(inputElement.value).toBe('123')
  })

  it('renders integer filters with negative values', async () => {
    const wrapper = await getPanelWrapper(`integer-field:"-3"`)
    const filterComponent = wrapper.findComponent(NumberFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputElement = filterComponent.find('input').element as HTMLInputElement
    expect(inputElement.value).toBe('-3')
  })

  it('renders float filters', async () => {
    const wrapper = await getPanelWrapper(`float-field:0.3`)
    const filterComponent = wrapper.findComponent(NumberFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputElement = filterComponent.find('input').element as HTMLInputElement
    expect(inputElement.value).toBe('0.3')
  })

  it('renders float filters with missing leading zeros', async () => {
    const wrapper = await getPanelWrapper(`float-field:.3`)
    const filterComponent = wrapper.findComponent(NumberFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputElement = filterComponent.find('input').element as HTMLInputElement
    expect(inputElement.value).toBe('0.3')
  })

  it('renders float filters with out of range values', async () => {
    const wrapper = await getPanelWrapper(`float-field:123.4`)
    const filterComponent = wrapper.findComponent(NumberFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputElement = filterComponent.find('input').element as HTMLInputElement
    expect(inputElement.value).toBe('123.4')
  })

  it('renders float filters with negative values', async () => {
    const wrapper = await getPanelWrapper(`float-field:"-3.4"`)
    const filterComponent = wrapper.findComponent(NumberFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputElement = filterComponent.find('input').element as HTMLInputElement
    expect(inputElement.value).toBe('-3.4')
  })

  // Number range filters

  it('renders integer range filters', async () => {
    const wrapper = await getPanelWrapper(`integer-range-field:[1 TO 3]`)
    const filterComponent = wrapper.findComponent(NumberRangeFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputs = filterComponent.findAll('input')
    expect(inputs.length).toBe(2)
    const leftInputElement = inputs.at(0).element as HTMLInputElement
    const rightInputElement = inputs.at(1).element as HTMLInputElement
    expect(leftInputElement.value).toBe('1')
    expect(rightInputElement.value).toBe('3')
  })

  it('renders integer range filters with out of range values', async () => {
    const wrapper = await getPanelWrapper(`integer-range-field:[0 TO 123]`)
    const filterComponent = wrapper.findComponent(NumberRangeFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputs = filterComponent.findAll('input')
    expect(inputs.length).toBe(2)
    const leftInputElement = inputs.at(0).element as HTMLInputElement
    const rightInputElement = inputs.at(1).element as HTMLInputElement
    expect(leftInputElement.value).toBe('0')
    expect(rightInputElement.value).toBe('123')
  })

  it('renders integer range filters with negative values', async () => {
    const wrapper = await getPanelWrapper(`integer-range-field:[-12 TO -5]`)
    const filterComponent = wrapper.findComponent(NumberRangeFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputs = filterComponent.findAll('input')
    expect(inputs.length).toBe(2)
    const leftInputElement = inputs.at(0).element as HTMLInputElement
    const rightInputElement = inputs.at(1).element as HTMLInputElement
    expect(leftInputElement.value).toBe('-12')
    expect(rightInputElement.value).toBe('-5')
  })

  it('renders integer range filters with inverted range', async () => {
    const wrapper = await getPanelWrapper(`integer-range-field:[3 TO 1]`)
    const filterComponent = wrapper.findComponent(NumberRangeFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputs = filterComponent.findAll('input')
    expect(inputs.length).toBe(2)
    const leftInputElement = inputs.at(0).element as HTMLInputElement
    const rightInputElement = inputs.at(1).element as HTMLInputElement
    expect(leftInputElement.value).toBe('1')
    expect(rightInputElement.value).toBe('3')
  })

  it('renders float range filters', async () => {
    const wrapper = await getPanelWrapper(`float-range-field:[0.1 TO 0.3]`)
    const filterComponent = wrapper.findComponent(NumberRangeFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputs = filterComponent.findAll('input')
    expect(inputs.length).toBe(2)
    const leftInputElement = inputs.at(0).element as HTMLInputElement
    const rightInputElement = inputs.at(1).element as HTMLInputElement
    expect(leftInputElement.value).toBe('0.1')
    expect(rightInputElement.value).toBe('0.3')
  })

  it('renders float range filters with missing leading zeros', async () => {
    const wrapper = await getPanelWrapper(`float-range-field:[.1 TO .3]`)
    const filterComponent = wrapper.findComponent(NumberRangeFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputs = filterComponent.findAll('input')
    expect(inputs.length).toBe(2)
    const leftInputElement = inputs.at(0).element as HTMLInputElement
    const rightInputElement = inputs.at(1).element as HTMLInputElement
    expect(leftInputElement.value).toBe('0.1')
    expect(rightInputElement.value).toBe('0.3')
  })

  it('renders float range filters with out of range values', async () => {
    const wrapper = await getPanelWrapper(`float-range-field:[0 TO 123.4]`)
    const filterComponent = wrapper.findComponent(NumberRangeFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputs = filterComponent.findAll('input')
    expect(inputs.length).toBe(2)
    const leftInputElement = inputs.at(0).element as HTMLInputElement
    const rightInputElement = inputs.at(1).element as HTMLInputElement
    expect(leftInputElement.value).toBe('0')
    expect(rightInputElement.value).toBe('123.4')
  })

  it('renders float range filters with negative values', async () => {
    const wrapper = await getPanelWrapper(`float-range-field:[-1.2 TO -0.5]`)
    const filterComponent = wrapper.findComponent(NumberRangeFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputs = filterComponent.findAll('input')
    expect(inputs.length).toBe(2)
    const leftInputElement = inputs.at(0).element as HTMLInputElement
    const rightInputElement = inputs.at(1).element as HTMLInputElement
    expect(leftInputElement.value).toBe('-1.2')
    expect(rightInputElement.value).toBe('-0.5')
  })

  it('renders float range filters with inverted range', async () => {
    const wrapper = await getPanelWrapper(`float-range-field:[0.3 TO 0.1]`)
    const filterComponent = wrapper.findComponent(NumberRangeFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputs = filterComponent.findAll('input')
    expect(inputs.length).toBe(2)
    const leftInputElement = inputs.at(0).element as HTMLInputElement
    const rightInputElement = inputs.at(1).element as HTMLInputElement
    expect(leftInputElement.value).toBe('0.1')
    expect(rightInputElement.value).toBe('0.3')
  })

  // Boolean filters

  it('renders boolean filters', async () => {
    const wrapper = await getPanelWrapper(`boolean-field:true`)
    const filterComponent = wrapper.findComponent(BooleanFilter)
    expect(filterComponent.exists()).toBe(true)
    const inputElement = filterComponent.find('input').element as HTMLInputElement
    expect(inputElement.checked).toBe(true)
  })

  // Enum filters

  it('renders enum filters', async () => {
    const wrapper = await getPanelWrapper(`enum-field:(red OR blue)`)
    const filterComponent = wrapper.findComponent(EnumFilter)
    expect(filterComponent.exists()).toBe(true)
    expect(filterComponent.props().modelValue).toEqual(['red', 'blue'])
    expect(filterComponent.text()).toBe('Red,Blue-ish')
  })

  it('renders enum filters with single parenthesized value', async () => {
    const wrapper = await getPanelWrapper(`enum-field:(red)`)
    const filterComponent = wrapper.findComponent(EnumFilter)
    expect(filterComponent.exists()).toBe(true)
    expect(filterComponent.props().modelValue).toEqual(['red'])
    expect(filterComponent.text()).toBe('Red')
  })

  it('renders enum filters with single unparenthesized value', async () => {
    const wrapper = await getPanelWrapper(`enum-field:red`)
    const filterComponent = wrapper.findComponent(EnumFilter)
    expect(filterComponent.exists()).toBe(true)
    expect(filterComponent.props().modelValue).toEqual(['red'])
    expect(filterComponent.text()).toBe('Red')
  })

  it('renders enum filters with empty value', async () => {
    const wrapper = await getPanelWrapper(`enum-field:""`)
    const filterComponent = wrapper.findComponent(EnumFilter)
    expect(filterComponent.exists()).toBe(true)
    expect(filterComponent.props().modelValue).toEqual([''])
    expect(filterComponent.text()).toBe('')
  })

  // Negative filters

  it('renders negative filters', async () => {
    const wrapper = await getPanelWrapper(`NOT string-field:hello NOT integer-range-field:[1 TO 3]`)

    const stringFilterComponent = wrapper.findComponent(StringFilter)
    expect(stringFilterComponent.exists()).toBe(true)
    const inputElement = stringFilterComponent.find('input').element as HTMLInputElement
    expect(inputElement.value).toBe('hello')

    const integerRangeFilterComponent = wrapper.findComponent(NumberRangeFilter)
    expect(integerRangeFilterComponent.exists()).toBe(true)
    const inputs = integerRangeFilterComponent.findAll('input')
    expect(inputs.length).toBe(2)
    const leftInputElement = inputs.at(0).element as HTMLInputElement
    const rightInputElement = inputs.at(1).element as HTMLInputElement
    expect(leftInputElement.value).toBe('1')
    expect(rightInputElement.value).toBe('3')
  })
})

describe('Filter.vue', () => {
  function getFilterWrapper(field: FilterField, value: any) {
    const wrapper = mount(Filter, {
      props: { field, modelValue: value },
      global: {
        plugins: [vuetify]
      }
    })
    return wrapper
  }

  it('renders displayName as label', () => {
    const field = testValues.stringField
    const wrapper = getFilterWrapper(field, 'test')
    expect(wrapper.text()).toBe(field.displayName + ':')
  })
})

describe('EnumFilter.vue', () => {
  function getEnumFilterWrapper(items: { [value: string]: string }, value: string[]) {
    const wrapper = mount(EnumFilter, {
      props: { items, modelValue: value },
      global: {
        plugins: [vuetify]
      }
    })
    return wrapper
  }

  it('renders human-readable options', () => {
    const wrapper = getEnumFilterWrapper(
      {
        option1: 'Human readable 1',
        option2: 'Human readable 2'
      },
      ['option1', 'option2']
    )
    expect(wrapper.text()).toBe('Human readable 1,Human readable 2')
  })
})
