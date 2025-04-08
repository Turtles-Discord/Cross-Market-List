'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Button, 
  Input, 
  Textarea, 
  Select, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui';
import { Card as CardComponent } from '@/components/ui/Card';
import { X, Upload, Plus, Pencil } from 'lucide-react';

interface ListingFormProps {
  isEditing?: boolean;
  initialData?: Listing;
  onSubmit: (data: ListingFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface Listing {
  id?: string;
  title: string;
  description: string;
  price: number;
  currency?: string;
  category: string;
  condition: string;
  images: string[];
  platforms: string[];
}

export type ListingFormData = Omit<Listing, 'id'>;

// Real category data
const categoryOptions = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'clothing', label: 'Clothing & Accessories' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'toys', label: 'Toys & Games' },
  { value: 'sports', label: 'Sports & Outdoors' },
  { value: 'collectibles', label: 'Collectibles' },
  { value: 'other', label: 'Other' },
];

const conditionOptions = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'for_parts', label: 'For Parts/Not Working' },
];

export function ListingForm({ 
  isEditing = false, 
  initialData, 
  onSubmit, 
  onCancel,
  isLoading = false
}: ListingFormProps) {
  const defaultData: ListingFormData = {
    title: '',
    description: '',
    price: 0,
    currency: 'USD',
    category: '',
    condition: '',
    images: [],
    platforms: [],
  };

  const [formData, setFormData] = useState<ListingFormData>(initialData || defaultData);
  const [errors, setErrors] = useState<Partial<Record<keyof ListingFormData, string>>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(initialData?.platforms || []);
  const [platforms, setPlatforms] = useState<{ value: string, label: string }[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // Fetch platforms from API
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await fetch('/api/sites/connected');
        
        if (!response.ok) {
          throw new Error('Failed to fetch connected platforms');
        }
        
        const data = await response.json();
        
        // Format data for dropdown
        const platformOptions = data.map((site: any) => ({
          value: site.site_id,
          label: site.site.name
        }));
        
        setPlatforms(platformOptions);
      } catch (error) {
        console.error('Error fetching platforms:', error);
      }
    };
    
    fetchPlatforms();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));

    // Clear error when field is updated
    if (errors[name as keyof ListingFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        return prev.filter(p => p !== platform);
      } else {
        return [...prev, platform];
      }
    });

    // Clear platforms error if any platform is selected
    if (errors.platforms) {
      setErrors(prev => ({
        ...prev,
        platforms: ''
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingImage(true);
    
    try {
      const file = files[0];
      
      // Create FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file to your API endpoint
      const response = await fetch('/api/uploads/image', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      
      // Add the image URL to the form data
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, data.url]
      }));
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ListingFormData, string>> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.condition) {
      newErrors.condition = 'Condition is required';
    }
    
    if (selectedPlatforms.length === 0) {
      newErrors.platforms = 'At least one platform must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure platforms are updated from selectedPlatforms state
    const dataToSubmit = {
      ...formData,
      platforms: selectedPlatforms
    };
    
    if (validateForm()) {
      onSubmit(dataToSubmit);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CardComponent>
        <CardHeader className="border-b">
          <CardTitle>{isEditing ? 'Edit Listing' : 'Create New Listing'}</CardTitle>
          <CardDescription>
            {isEditing 
              ? 'Update your listing details below' 
              : 'Fill in the details below to create a new listing'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. iPhone 13 Pro Max - 256GB - Graphite"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600 dark:text-red-500">
                {errors.title}
              </p>
            )}
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your item in detail..."
              rows={5}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600 dark:text-red-500">
                {errors.description}
              </p>
            )}
          </div>
          
          {/* Price & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-medium">
                Price
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="text-sm text-red-600 dark:text-red-500">
                  {errors.price}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="currency" className="block text-sm font-medium">
                Currency
              </label>
              <Select
                options={[
                  { value: 'USD', label: 'USD - US Dollar' },
                  { value: 'EUR', label: 'EUR - Euro' },
                  { value: 'GBP', label: 'GBP - British Pound' },
                  { value: 'CAD', label: 'CAD - Canadian Dollar' },
                  { value: 'AUD', label: 'AUD - Australian Dollar' }
                ]}
                name="currency"
                value={formData.currency}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {/* Category & Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium">
                Category
              </label>
              <Select
                options={categoryOptions}
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? 'border-red-500' : ''}
              />
              {errors.category && (
                <p className="text-sm text-red-600 dark:text-red-500">
                  {errors.category}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="condition" className="block text-sm font-medium">
                Condition
              </label>
              <Select
                options={conditionOptions}
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className={errors.condition ? 'border-red-500' : ''}
              />
              {errors.condition && (
                <p className="text-sm text-red-600 dark:text-red-500">
                  {errors.condition}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </CardComponent>
      
      {/* Images */}
      <CardComponent className="overflow-hidden">
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>
            Upload images of your item
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-md overflow-hidden group">
                <img 
                  src={image} 
                  alt={`Listing image ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs py-1 text-center">
                    Cover Image
                  </div>
                )}
              </div>
            ))}
            
            {formData.images.length < 10 && (
              <button
                type="button"
                onClick={handleUploadButtonClick}
                disabled={uploadingImage}
                className="aspect-square rounded-md border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
              >
                {uploadingImage ? (
                  <div className="animate-pulse">Uploading...</div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 mb-2" />
                    <span className="text-sm">Add Image</span>
                  </>
                )}
              </button>
            )}
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            You can upload up to 10 images. First image will be used as the cover.
          </p>
        </CardContent>
      </CardComponent>
      
      {/* Platforms */}
      <CardComponent className="overflow-hidden">
        <CardHeader>
          <CardTitle>Platforms</CardTitle>
          <CardDescription>
            Select the platforms where you want to list this item
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {errors.platforms && (
              <p className="text-sm text-red-600 dark:text-red-500 mb-2">
                {errors.platforms}
              </p>
            )}
            
            {platforms.length === 0 ? (
              <div className="text-center p-6 text-gray-500 dark:text-gray-400">
                <p>No connected platforms found. Please connect at least one platform first.</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => window.location.href = '/sites/connect'}
                >
                  Connect Platforms
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {platforms.map(platform => (
                  <div
                    key={platform.value}
                    className={`
                      flex items-center p-4 rounded-lg border cursor-pointer
                      ${selectedPlatforms.includes(platform.value)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                        : 'border-gray-200 dark:border-gray-700'}
                    `}
                    onClick={() => togglePlatform(platform.value)}
                  >
                    <div className={`
                      w-5 h-5 rounded-full flex items-center justify-center mr-3
                      ${selectedPlatforms.includes(platform.value)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700'}
                    `}>
                      {selectedPlatforms.includes(platform.value) && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">{platform.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Your listing will be posted to all selected platforms. Each platform may have its own listing requirements.
          </p>
        </CardContent>
      </CardComponent>
      
      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : isEditing ? 'Update Listing' : 'Create Listing'}
        </Button>
      </div>
    </form>
  );
} 