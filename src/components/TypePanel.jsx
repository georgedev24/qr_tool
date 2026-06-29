import './TypePanel.css'
import WifiForm from './forms/WifiForm'
import UrlForm from './forms/UrlForm'
import ContactForm from './forms/ContactForm'
import EmailForm from './forms/EmailForm'
import SmsForm from './forms/SmsForm'
import PhoneForm from './forms/PhoneForm'
import LocationForm from './forms/LocationForm'
import EventForm from './forms/EventForm'
import TextForm from './forms/TextForm'
import CryptoForm from './forms/CryptoForm'

const FORMS = {
  wifi: WifiForm,
  url: UrlForm,
  contact: ContactForm,
  email: EmailForm,
  sms: SmsForm,
  phone: PhoneForm,
  location: LocationForm,
  event: EventForm,
  text: TextForm,
  crypto: CryptoForm,
}

export default function TypePanel({ types, activeType, onTypeChange, formData, onDataChange }) {
  const Form = FORMS[activeType]

  return (
    <div className="type-panel">
      <div className="type-list">
        <div className="panel-heading">QR Type</div>
        {types.map(t => (
          <button
            key={t.id}
            className={`type-item ${activeType === t.id ? 'active' : ''}`}
            onClick={() => onTypeChange(t.id)}
          >
            <span className="type-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      <div className="form-area">
        <div className="panel-heading">Content</div>
        {Form && <Form data={formData} onChange={onDataChange} />}
      </div>
    </div>
  )
}
