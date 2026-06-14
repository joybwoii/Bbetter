export const dynamic = 'force-dynamic';
import { getProductById, getCategories } from '@/lib/actions/firestore';
import ProductForm from '../../components/ProductForm';
import ReviewForm from './ReviewForm';
import styles from '../../../admin.module.css';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  const categories = await getCategories();

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>Edit Product</h1>
      <ProductForm initialData={product} categories={categories} isEdit={true} />
      <ReviewForm productId={id} />
    </div>
  );
}
