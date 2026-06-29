import { Field, Input, Textarea } from './Field'

export default function EventForm({ data, onChange }) {
  return (
    <>
      <Field label="Title"><Input value={data.title} onChange={v => onChange('title', v)} placeholder="Meeting" /></Field>
      <Field label="Start"><Input value={data.start} onChange={v => onChange('start', v)} type="datetime-local" /></Field>
      <Field label="End"><Input value={data.end} onChange={v => onChange('end', v)} type="datetime-local" /></Field>
      <Field label="Location"><Input value={data.location} onChange={v => onChange('location', v)} placeholder="Office, Athens" /></Field>
      <Field label="Description"><Textarea value={data.description} onChange={v => onChange('description', v)} placeholder="Details..." /></Field>
    </>
  )
}
