export type Send = (method: string, params?: any[]) => Promise<{ result: any }>

export type SendDeprecated = (
  payload: { method: string; params?: any[] },
  callback: (error: Error, result: { result: any }) => void
) => void
