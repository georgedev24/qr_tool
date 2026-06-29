import { Field, Input, Textarea } from './Field'

export default function SmsForm({ data, onChange }) {
  return (
    <>
      <Field label="Phone number"><Input value={data.phone} onChange={v => onChange('phone', v)} placeholder="+30 69..." /></Field>
      <Field label="Message"><Textarea value={data.message} onChange={v => onChange('message', v)} placeholder="Your message..." /></Field>
    </>
  )
}
