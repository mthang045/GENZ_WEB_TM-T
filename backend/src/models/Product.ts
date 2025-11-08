// MongoDB collection: products
// No longer using Mongoose models - using native MongoDB driver
// Define structure in comments for reference

/*
Collection: products
{
  _id: ObjectId,
  id?: string,
  name: string (required),
  description?: string,
  price: number (required),
  brand?: string,
  image?: string,
  images?: string[],
  category?: string,
  rating?: number,
  features?: string[],
  colors?: string[],
  sizes?: string[],
  stock?: Array<{
    color: string,
    size: string,
    quantity: number
  }>,
  weight?: string,
  certification?: string[],
  createdAt: Date,
  updatedAt: Date
}
*/
