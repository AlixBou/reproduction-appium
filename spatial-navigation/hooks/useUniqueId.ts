import uniqueId from 'lodash.uniqueid'
import { useMemo } from 'react'

export const useUniqueId = (prefix?: string) => useMemo(() => uniqueId(prefix), [prefix])
