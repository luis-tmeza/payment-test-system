<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import axios from 'axios'
import creditCardType from 'credit-card-type'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'tokenized'])

const cardNumber = ref('')
const expMonth = ref('')
const expYear = ref('')
const cvc = ref('')
const holder = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const formRef = ref()

const cardNumberDigits = computed(() => cardNumber.value.replace(/\D/g, ''))
const detectedType = computed(() => {
  if (!cardNumberDigits.value) return null
  return creditCardType(cardNumberDigits.value)[0] ?? null
})
const cardBrand = computed(() => detectedType.value?.type ?? null)

const formatCardNumber = (
  digits: string,
  type: ReturnType<typeof creditCardType>[number] | null
) => {
  if (!digits) return ''
  const gaps = type?.gaps ?? [4, 8, 12, 16]
  let out = ''
  for (let i = 0; i < digits.length; i += 1) {
    if (gaps.includes(i) && i !== 0) out += ' '
    out += digits[i]
  }
  return out
}

const handleCardNumberInput = (val: string) => {
  const digits = (val ?? '').replace(/\D/g, '')
  const type = creditCardType(digits)[0] ?? null
  const maxLen = Math.max(...(type?.lengths ?? [19]))
  const trimmed = digits.slice(0, maxLen)
  cardNumber.value = formatCardNumber(trimmed, type)
}

const handleExpMonthInput = (val: string) => {
  expMonth.value = (val ?? '').replace(/\D/g, '').slice(0, 2)
}

const handleExpYearInput = (val: string) => {
  expYear.value = (val ?? '').replace(/\D/g, '').slice(0, 2)
}

const handleCvcInput = (val: string) => {
  const maxLen = detectedType.value?.code?.size ?? 4
  cvc.value = (val ?? '').replace(/\D/g, '').slice(0, maxLen)
}

const isExpiryValid = () => {
  if (!expMonth.value || !expYear.value) return false
  const month = Number(expMonth.value)
  const year = Number(expYear.value)
  if (!Number.isFinite(month) || !Number.isFinite(year)) return false
  if (month < 1 || month > 12) return false
  const fullYear = 2000 + year
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  if (fullYear < currentYear) return false
  if (fullYear === currentYear && month < currentMonth) return false
  return true
}

const cardNumberRules = computed(() => [
  (v: string) => (!!v && cardNumberDigits.value.length > 0) || 'Card number is required.',
  () => {
    const digitsLen = cardNumberDigits.value.length
    if (!digitsLen) return true
    const lengths = detectedType.value?.lengths ?? [12, 13, 14, 15, 16, 17, 18, 19]
    return lengths.includes(digitsLen) || 'Invalid card number length.'
  },
])

const expMonthRules = computed(() => [
  (v: string) => !!v || 'Expiration month is required.',
  () => {
    const month = Number(expMonth.value)
    return month >= 1 && month <= 12 || 'Invalid month.'
  },
])

const expYearRules = computed(() => [
  (v: string) => !!v || 'Expiration year is required.',
  () => isExpiryValid() || 'Card is expired or date is invalid.',
])

const cvcRules = computed(() => [
  (v: string) => !!v || 'CVC is required.',
  () => {
    const len = cvc.value.length
    const size = detectedType.value?.code?.size
    if (size) return len === size || `CVC must be ${size} digits.`
    return (len === 3 || len === 4) || 'CVC must be 3 or 4 digits.'
  },
])

const holderRules = computed(() => [
  (v: string) => !!v || 'Cardholder name is required.',
  () => holder.value.trim().length >= 2 || 'Cardholder name is too short.',
])

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      cardNumber.value = ''
      expMonth.value = ''
      expYear.value = ''
      cvc.value = ''
      holder.value = ''
    }
  }
)

watch([cardNumber, expMonth, expYear, cvc, holder], () => {
  if (errorMessage.value) errorMessage.value = null
})

const tokenize = async () => {
  const form = formRef.value
  if (form && typeof form.validate === 'function') {
    const result = await form.validate()
    if (!result.valid) {
      errorMessage.value = 'Please correct the highlighted fields.'
      return
    }
  }

  loading.value = true
  errorMessage.value = null

  try {
    const response = await axios.post(
      'https://api-sandbox.co.uat.wompi.dev/v1/tokens/cards',
      {
        number: cardNumberDigits.value,
        exp_month: expMonth.value,
        exp_year: expYear.value,
        cvc: cvc.value,
        card_holder: holder.value,
      },
      {
        headers: {
          Authorization: 'Bearer pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7',
        },
      }
    )

    emit('tokenized', response.data.data.id)
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Card tokenization failed:', error)
    errorMessage.value = 'No se pudo tokenizar la tarjeta. Verifica los datos e intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-dialog :model-value="modelValue" fullscreen transition="dialog-bottom-transition">
    <v-card>
      <v-toolbar>
        <v-toolbar-title> Credit Card </v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="$emit('update:modelValue', false)"> X </v-btn>
      </v-toolbar>

      <v-card-text>
        <v-form ref="formRef" validate-on="blur">
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="mb-3"
          >
            {{ errorMessage }}
          </v-alert>
          <v-row justify="center" class="mb-3" v-if="cardBrand">
            <v-img
              :src="`/cards/${cardBrand}.svg`"
              max-width="64"
            />
          </v-row>
          <v-text-field
            label="Card Number"
            v-model="cardNumber"
            inputmode="numeric"
            autocomplete="cc-number"
            :rules="cardNumberRules"
            @update:model-value="handleCardNumberInput"
          />
          <v-row>
            <v-col cols="6">
              <v-text-field
                label="MM"
                v-model="expMonth"
                inputmode="numeric"
                autocomplete="cc-exp-month"
                :rules="expMonthRules"
                @update:model-value="handleExpMonthInput"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="YY"
                v-model="expYear"
                inputmode="numeric"
                autocomplete="cc-exp-year"
                :rules="expYearRules"
                @update:model-value="handleExpYearInput"
              />
            </v-col>
          </v-row>
          <v-text-field
            label="CVC"
            v-model="cvc"
            inputmode="numeric"
            autocomplete="cc-csc"
            :rules="cvcRules"
            @update:model-value="handleCvcInput"
          />
          <v-text-field
            label="Cardholder name"
            v-model="holder"
            autocomplete="cc-name"
            :rules="holderRules"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn color="primary" block size="large" :loading="loading" @click="tokenize">
          Continue
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
