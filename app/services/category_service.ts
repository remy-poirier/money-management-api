import Category from '#models/category'

export default class CategoryService {
  async all() {
    return await Category.all()
  }
}
