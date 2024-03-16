export interface FormFields {
  fields: Map<string, string>
  coverLetter: string
  resume: string
}

export function saveFormFields(formFields: FormFields): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ formField: formFields }, () => {
      resolve()
    })
  })
}

export function retrieveFormFields(): Promise<FormFields> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['formFields'], (res) => {
      resolve(
        res.formFields ?? {
          fields: {},
          coverLetter: '',
          resume: '',
        }
      )
    })
  })
}
