import { useContext } from 'react'

import { AppServicesContext } from './ServicesProvider'

export const useServices = () => {
  const services = useContext(AppServicesContext)

  if (!services) {
    throw new Error('ServicesProvider is missing.')
  }

  return services
}
