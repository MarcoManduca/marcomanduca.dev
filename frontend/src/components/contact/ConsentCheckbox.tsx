import { Trans } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Checkbox } from '@/components/ui/Checkbox'

interface ConsentCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

/** Required privacy-policy consent, with an inline link to the policy. */
export const ConsentCheckbox = ({
  checked,
  onChange,
}: ConsentCheckboxProps) => (
  <Checkbox
    name="consent"
    required
    checked={checked}
    onChange={(event) => onChange(event.target.checked)}
    label={
      <Trans
        i18nKey="contacts.consent"
        components={{
          privacy: (
            <Link
              to="/privacy-policy"
              className="text-accent transition-colors hover:text-accent-hover"
            />
          ),
        }}
      />
    }
  />
)
