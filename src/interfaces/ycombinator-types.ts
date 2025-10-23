export type Startup = {
  startupID: number
  name: string
  website: string
  description: string
  VC_firm: "YCombinator" // literal type (only this value allowed)
  services: string | undefined
  founder_names: string[] | undefined
  foundedAt: string
}