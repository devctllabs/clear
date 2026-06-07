export const FieldValidationMessages = ({
  id,
  messages,
}: {
  id?: string
  messages?: string[]
}) => {
  if (!id || !messages?.length) {
    return null
  }

  return (
    <ul className="mt-3 space-y-1 text-sm font-semibold leading-5 text-destructive" id={id}>
      {messages.map((message) => (
        <li className="text-wrap-anywhere" key={message}>
          {message}
        </li>
      ))}
    </ul>
  )
}
