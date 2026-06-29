import { Field, Input } from './Field'

export default function UrlForm({ data, onChange }) {
  return (
    <Field label="URL">
      <Input value={data.url} onChange={v => onChange('url', v)} placeholder="https://example.com" />
    </Field>
  )
}
