<script setup>
import { CalendarRoot, useForwardPropsEmits, useDateFormatter } from 'reka-ui'
import { createDecade, createYear, toDate } from 'reka-ui/date'
import { getLocalTimeZone, today, CalendarDate } from '@internationalized/date'
import { computed, ref, watch } from 'vue'
import { cn } from '@/uikit/lib/utils'
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
} from '@/uikit/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/uikit/components/ui/select'

const props = defineProps({
  defaultValue: { type: null, required: false },
  defaultPlaceholder: { type: null, required: false },
  placeholder: { type: null, required: false },
  pagedNavigation: { type: Boolean, required: false },
  preventDeselect: { type: Boolean, required: false },
  weekStartsOn: { type: Number, required: false },
  weekdayFormat: { type: String, required: false, default: 'short' },
  calendarLabel: { type: String, required: false },
  fixedWeeks: { type: Boolean, required: false },
  maxValue: { type: null, required: false },
  minValue: { type: null, required: false },
  locale: { type: String, required: false },
  numberOfMonths: { type: Number, required: false },
  disabled: { type: Boolean, required: false },
  readonly: { type: Boolean, required: false },
  initialFocus: { type: Boolean, required: false },
  isDateDisabled: { type: Function, required: false },
  isDateUnavailable: { type: Function, required: false },
  dir: { type: String, required: false },
  nextPage: { type: Function, required: false },
  prevPage: { type: Function, required: false },
  modelValue: { type: String, required: false }, // ISO date string (YYYY-MM-DD)
  multiple: { type: Boolean, required: false },
  disableDaysOutsideCurrentView: { type: Boolean, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: null, required: false },
})
const emits = defineEmits(['update:modelValue', 'update:placeholder'])

// Convert ISO string to CalendarDate
function isoToCalendarDate(isoString) {
  if (!isoString || typeof isoString !== 'string') return null
  const [year, month, day] = isoString.split('-').map(Number)
  return new CalendarDate(year, month, day)
}

// Convert CalendarDate to ISO string
function calendarDateToIso(calendarDate) {
  if (!calendarDate) return ''
  const date = calendarDate.toDate(getLocalTimeZone())
  return date.toISOString().split('T')[0]
}

// Internal state for placeholder (controls which month/year is shown)
const placeholderRef = ref(
  (props.modelValue && typeof props.modelValue === 'string')
    ? isoToCalendarDate(props.modelValue)
    : today(getLocalTimeZone())
)

// Watch for external changes to modelValue and update placeholder
watch(() => props.modelValue, (newValue) => {
  if (!newValue || typeof newValue !== 'string') {
    return
  }
  const newDate = isoToCalendarDate(newValue)
  if (newDate && (!placeholderRef.value || calendarDateToIso(newDate) !== calendarDateToIso(placeholderRef.value))) {
    placeholderRef.value = newDate
  }
})

// Forward only the props we need to CalendarRoot (exclude modelValue, placeholder, class)
const calendarProps = computed(() => {
  const { class: _, placeholder, modelValue, ...rest } = props
  return rest
})

const formatter = useDateFormatter('en')

// Create year range from 100 years ago to current year based on today's date
const currentDate = today(getLocalTimeZone())
const yearRange = createDecade({ dateObj: currentDate, startIndex: -100, endIndex: 0 })
</script>

<template>
  <CalendarRoot
    v-slot="{ grid, weekDays, date }"
    v-model:placeholder="placeholderRef"
    :model-value="isoToCalendarDate(props.modelValue)"
    @update:model-value="(val) => {
      if (val) {
        emits('update:modelValue', calendarDateToIso(val))
      }
    }"
    @update:placeholder="(val) => emits('update:placeholder', val)"
    :class="cn('p-3', props.class)"
    v-bind="calendarProps"
  >
    <CalendarHeader>
      <CalendarHeading class="flex w-full items-center justify-between gap-2">
        <Select
          :model-value="placeholderRef.month.toString()"
          @update:model-value="(v) => {
            if (!v || !placeholderRef) return;
            if (Number(v) === placeholderRef.month) return;
            const newPlaceholder = placeholderRef.set({ month: Number(v) })
            placeholderRef = newPlaceholder
            // If there's a selected date, update it too
            if (props.modelValue) {
              emits('update:modelValue', calendarDateToIso(newPlaceholder))
            }
          }"
        >
          <SelectTrigger aria-label="Select month" class="w-[60%]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent class="max-h-[200px]">
            <SelectItem
              v-for="month in createYear({ dateObj: date })"
              :key="month.toString()"
              :value="month.month.toString()"
            >
              {{ formatter.custom(toDate(month), { month: 'long' }) }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          :model-value="placeholderRef.year.toString()"
          @update:model-value="(v) => {
            if (!v || !placeholderRef) return;
            if (Number(v) === placeholderRef.year) return;
            const newPlaceholder = placeholderRef.set({ year: Number(v) })
            placeholderRef = newPlaceholder
            // If there's a selected date, update it too
            if (props.modelValue) {
              emits('update:modelValue', calendarDateToIso(newPlaceholder))
            }
          }"
        >
          <SelectTrigger aria-label="Select year" class="w-[40%]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent class="max-h-[200px]">
            <SelectItem
              v-for="yearValue in yearRange"
              :key="yearValue.toString()"
              :value="yearValue.year.toString()"
            >
              {{ yearValue.year }}
            </SelectItem>
          </SelectContent>
        </Select>
      </CalendarHeading>
    </CalendarHeader>

    <div class="flex flex-col gap-y-4 mt-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
      <CalendarGrid v-for="month in grid" :key="month.value.toString()">
        <CalendarGridHead>
          <CalendarGridRow>
            <CalendarHeadCell v-for="day in weekDays" :key="day">
              {{ day }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody>
          <CalendarGridRow v-for="(weekDates, index) in month.rows" :key="`weekDate-${index}`" class="mt-2 w-full">
            <CalendarCell v-for="weekDate in weekDates" :key="weekDate.toString()" :date="weekDate">
              <CalendarCellTrigger :day="weekDate" :month="month.value" />
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </div>
  </CalendarRoot>
</template>
