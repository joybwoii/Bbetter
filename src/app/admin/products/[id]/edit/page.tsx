import { getProductById, getCategories } from '@/lib/actions/firestore';
import ProductForm from '../../components/ProductForm';
import styles from '../../../admin.module.css';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const product = await getProductById(id);
  const categories = await getCategories();

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>Edit Product</h1>
      <ProductForm initialData={product} categories={categories} isEdit={true} />
    </div>
  );
}
