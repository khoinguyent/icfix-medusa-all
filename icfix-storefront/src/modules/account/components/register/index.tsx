"use client"

import { signup } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { Checkbox, Label, Text } from "@medusajs/ui"
import { ChangeEvent, useActionState, useState } from "react"
import { useTranslations } from 'next-intl'

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

interface FormData {
  email: string
  first_name: string
  last_name: string
  phone: string
  password: string
}

const initialFormData: FormData = {
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  password: "",
}

const placeholder = ({
  placeholder,
  required,
}: {
  placeholder: string
  required: boolean
}) => {
  return (
    <span className="text-ui-fg-muted">
      {placeholder}
      {required && <span className="text-ui-fg-error">*</span>}
    </span>
  )
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const t = useTranslations('auth.register')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const isValid =
    termsAccepted &&
    !!formData.email &&
    !!formData.first_name &&
    !!formData.last_name &&
    !!formData.phone &&
    !!formData.password

  return (
    <div
      className="max-w-sm flex flex-col items-start gap-2 my-8"
      data-testid="register-page"
    >
      <Text className="text-4xl text-neutral-950 text-left mb-4">
        {t('title')}
      </Text>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-4">
          <Input
            label={t('email')}
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
            className="bg-white"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            label={t('first_name')}
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
            className="bg-white"
            value={formData.first_name}
            onChange={handleChange}
          />
          <Input
            label={t('last_name')}
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
            className="bg-white"
            value={formData.last_name}
            onChange={handleChange}
          />
          <Input
            label={t('phone')}
            name="phone"
            required
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
            className="bg-white"
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            label={t('password')}
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
            className="bg-white"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className="border-b border-neutral-200 my-6" />
        <ErrorMessage error={message} data-testid="register-error" />
        <div className="flex items-center gap-2">
          <Checkbox
            name="terms"
            id="terms-checkbox"
            data-testid="terms-checkbox"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(!!checked)}
          ></Checkbox>
          <Label
            id="terms-label"
            className="flex items-center text-ui-fg-base !text-xs hover:cursor-pointer !transform-none"
            htmlFor="terms-checkbox"
            data-testid="terms-label"
          >
            {t('terms_and_conditions')}
          </Label>
        </div>
        <SubmitButton
          className="w-full mt-6"
          data-testid="register-button"
          disabled={!isValid}
        >
          {t('submit')}
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        {t('have_account')}{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.LOG_IN)}
          className="underline"
        >
          {t('sign_in')}
        </button>
        .
      </span>
    </div>
  )
}

export default Register
