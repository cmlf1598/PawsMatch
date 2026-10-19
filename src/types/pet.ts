export interface Pet {
  id: number
  name: string
  /** Dog CEO breed path, e.g. 'labrador', 'retriever/golden' or 'mix'. */
  breed: string
  bio: string[]
  image: string
}
