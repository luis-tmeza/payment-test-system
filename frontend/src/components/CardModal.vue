<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import axios from 'axios'
import creditCardType from 'credit-card-type';

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'tokenized'])

const cardNumber = ref('')
const expMonth = ref('')
const expYear = ref('')
const cvc = ref('')
const holder = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const cardBrand = computed(() => {
  if (!cardNumber.value) return null;

  const types = creditCardType(cardNumber.value);

  return types[0]?.type ?? null;
});

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

const tokenize = async () => {
  loading.value = true
  errorMessage.value = null

  try {
    const response = await axios.post(
    'https://api-sandbox.co.uat.wompi.dev/v1/tokens/cards',
    {
      number: cardNumber.value,
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
    console.error('🚀 ~ tokenize ~ error:', error)
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
        <v-btn icon @click="$emit('update:modelValue', false)"> ✕ </v-btn>
      </v-toolbar>

      <v-card-text>
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
        <v-text-field label="Card Number" v-model="cardNumber" />
        <v-row>
          <v-col cols="6">
            <v-text-field label="MM" v-model="expMonth" />
          </v-col>
          <v-col cols="6">
            <v-text-field label="YY" v-model="expYear" />
          </v-col>
        </v-row>
        <v-text-field label="CVC" v-model="cvc" />
        <v-text-field label="Cardholder name" v-model="holder" />
      </v-card-text>

      <v-card-actions>
        <v-btn color="primary" block size="large" :loading="loading" @click="tokenize">
          Continue
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

