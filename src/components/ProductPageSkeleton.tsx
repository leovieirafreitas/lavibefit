export default function ProductPageSkeleton() {
    return (
        <div className="pt-24 pb-12 container mx-auto px-4 md:px-6 animate-pulse">
            {/* Breadcrumb Skeleton */}
            <div className="h-4 w-48 bg-gray-200 rounded mb-6"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left: Image Gallery Skeleton */}
                <div>
                    {/* Main Image Skeleton */}
                    <div className="relative aspect-[3/4] bg-gray-200 rounded-2xl mb-4"></div>

                    {/* Thumbnail Gallery Skeleton */}
                    <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>

                {/* Right: Product Info Skeleton */}
                <div>
                    {/* Badge Skeleton */}
                    <div className="h-6 w-40 bg-gray-200 rounded mb-3"></div>

                    {/* Title Skeleton */}
                    <div className="h-8 w-3/4 bg-gray-200 rounded mb-3"></div>

                    {/* Rating Skeleton */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                        <div className="h-4 w-12 bg-gray-200 rounded"></div>
                    </div>

                    {/* Price Skeleton */}
                    <div className="mb-6">
                        <div className="h-3 w-32 bg-gray-200 rounded mb-2"></div>
                        <div className="h-10 w-40 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-48 bg-gray-200 rounded"></div>
                    </div>

                    {/* Size Selector Skeleton */}
                    <div className="mb-6">
                        <div className="h-4 w-24 bg-gray-200 rounded mb-3"></div>
                        <div className="grid grid-cols-4 gap-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-12 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>

                    {/* Buttons Skeleton */}
                    <div className="h-14 w-full bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-12 w-full bg-gray-200 rounded-lg"></div>

                    {/* Description Skeleton */}
                    <div className="mt-8 pt-8 border-t">
                        <div className="h-6 w-32 bg-gray-200 rounded mb-3"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-gray-200 rounded"></div>
                            <div className="h-4 w-full bg-gray-200 rounded"></div>
                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
