import SingleProduct from "@/components/ui/product/SingleProduct"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
export const dynamic = "force-dynamic";
export default async function SingleProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params 

  try {
    const response = await fetch(`${apiUrl}/api/store-data/products/item?id=${slug}`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac)"
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error("Product not found")
    }

    const data = await response.json()
    return <SingleProduct product={data.product} />
  } catch (err) {
    console.log(err)
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-red-600">عذرا المنتج غير موجود</h1>
        <p className="text-gray-600 mt-4">المنتج هاذا غير متوفر حاليا , عد للصفحة السابقة</p>
      </div>
    )
  }
}
