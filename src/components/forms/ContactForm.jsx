import { Field, Input } from './Field'

export default function ContactForm({ data, onChange }) {
  return (
    <>
      <Field label="First name"><Input value={data.firstName} onChange={v => onChange('firstName', v)} placeholder="John" /></Field>
      <Field label="Last name"><Input value={data.lastName} onChange={v => onChange('lastName', v)} placeholder="Doe" /></Field>
      <Field label="Phone"><Input value={data.phone} onChange={v => onChange('phone', v)} placeholder="+30 69..." /></Field>
      <Field label="Email"><Input value={data.email} onChange={v => onChange('email', v)} placeholder="john@example.com" /></Field>
      <Field label="Organization"><Input value={data.org} onChange={v => onChange('org', v)} placeholder="Company" /></Field>
      <Field label="Website"><Input value={data.url} onChange={v => onChange('url', v)} placeholder="https://" /></Field>
    </>
  )
}
