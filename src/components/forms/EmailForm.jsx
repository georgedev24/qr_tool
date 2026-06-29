import { Field, Input, Textarea } from './Field'

export default function EmailForm({ data, onChange }) {
  return (
    <>
      <Field label="To"><Input value={data.to} onChange={v => onChange('to', v)} placeholder="recipient@example.com" /></Field>
      <Field label="Subject"><Input value={data.subject} onChange={v => onChange('subject', v)} placeholder="Subject" /></Field>
      <Field label="Body"><Textarea value={data.body} onChange={v => onChange('body', v)} placeholder="Message..." /></Field>
    </>
  )
}
