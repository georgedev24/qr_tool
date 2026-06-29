import { Field, Input } from './Field'

export default function PhoneForm({ data, onChange }) {
  return (
    <Field label="Phone number">
      <Input value={data.phone} onChange={v => onChange('phone', v)} placeholder="+30 69..." />
    </Field>
  )
}
