'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  DollarSign,
  Clock,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { RoleGate } from '@/features/auth/components/role-gate';
import { Textarea } from '@/components/ui/textarea';

interface PackageType {
  id: number;
  title: string | null;
  description: string | null;
  current_price: string;
  original_price: string;
  discount: string;
  subscription_frequency: string;
  days: number;
  class_duration: number;
  total_classes: number | null;
  duration_weeks: number | null;
  subject: string | null;
  level: string | null;
  features: string[];
  currency: string;
  is_popular: boolean;
  is_active: boolean;
  package_type: string;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export default function AdminPackagesPage() {
  const t = useTranslations('Admin');
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(
    null
  );
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    current_price: '',
    original_price: '',
    discount: '',
    subscription_frequency: 'monthly',
    days: 1,
    class_duration: 30,
    total_classes: 0,
    duration_weeks: 4,
    subject: '',
    level: 'Beginner',
    features: '',
    currency: 'USD',
    is_popular: false,
    is_active: true,
    package_type: 'standard',
    sort_order: 1,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/admin/packages');
      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages || []);
      } else {
        toast.error('Failed to fetch packages');
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Error fetching packages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async () => {
    try {
      const response = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          features: formData.features.split(',').map((f) => f.trim()),
        }),
      });

      if (response.ok) {
        toast.success('Package created successfully');
        setIsCreateOpen(false);
        resetForm();
        fetchPackages();
      } else {
        toast.error('Failed to create package');
      }
    } catch (error) {
      console.error('Error creating package:', error);
      toast.error('Error creating package');
    }
  };

  const handleUpdatePackage = async () => {
    if (!selectedPackage) return;

    try {
      const response = await fetch(
        `/api/admin/packages/${selectedPackage.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            features: formData.features.split(',').map((f) => f.trim()),
          }),
        }
      );

      if (response.ok) {
        toast.success('Package updated successfully');
        setIsEditOpen(false);
        resetForm();
        fetchPackages();
      } else {
        toast.error('Failed to update package');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      toast.error('Error updating package');
    }
  };

  const handleDeletePackage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const response = await fetch(`/api/admin/packages/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Package deleted successfully');
        fetchPackages();
      } else {
        toast.error('Failed to delete package');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Error deleting package');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      current_price: '',
      original_price: '',
      discount: '',
      subscription_frequency: 'monthly',
      days: 1,
      class_duration: 30,
      total_classes: 0,
      duration_weeks: 4,
      subject: '',
      level: 'Beginner',
      features: '',
      currency: 'USD',
      is_popular: false,
      is_active: true,
      package_type: 'standard',
      sort_order: 1,
    });
    setSelectedPackage(null);
  };

  const openEditDialog = (pkg: PackageType) => {
    setSelectedPackage(pkg);
    setFormData({
      title: pkg.title || '',
      description: pkg.description || '',
      current_price: pkg.current_price,
      original_price: pkg.original_price,
      discount: pkg.discount,
      subscription_frequency: pkg.subscription_frequency,
      days: pkg.days,
      class_duration: pkg.class_duration,
      total_classes: pkg.total_classes || 0,
      duration_weeks: pkg.duration_weeks || 4,
      subject: pkg.subject || '',
      level: pkg.level || 'Beginner',
      features: pkg.features.join(', '),
      currency: pkg.currency,
      is_popular: pkg.is_popular,
      is_active: pkg.is_active,
      package_type: pkg.package_type,
      sort_order: pkg.sort_order || 1,
    });
    setIsEditOpen(true);
  };

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.package_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RoleGate allowedRole='ADMIN'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold'>Package Management</h1>
            <p className='text-muted-foreground'>
              Manage learning packages and subscriptions
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className='h-4 w-4 mr-2' />
            Create Package
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Packages
              </CardTitle>
              <Package className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{packages.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Packages
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {packages.filter((p) => p.is_active).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Popular Packages
              </CardTitle>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {packages.filter((p) => p.is_popular).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Avg. Duration
              </CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {packages.length > 0
                  ? Math.round(
                      packages.reduce((acc, p) => acc + p.class_duration, 0) /
                        packages.length
                    )
                  : 0}{' '}
                min
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className='flex items-center space-x-2 mb-6'>
          <div className='relative flex-1 max-w-sm'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search packages...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-8'
            />
          </div>
        </div>

        {/* Packages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Packages</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='text-center py-8'>Loading packages...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPackages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell>
                        <div>
                          <div className='font-medium'>
                            {pkg.title || pkg.package_type}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {pkg.subject} • {pkg.level}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className='font-medium'>
                            {pkg.currency} {pkg.current_price}
                          </div>
                          {pkg.discount && (
                            <div className='text-sm text-muted-foreground line-through'>
                              {pkg.currency} {pkg.original_price}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {pkg.class_duration} min • {pkg.days} days/week
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {pkg.subscription_frequency}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-1'>
                          <Badge
                            variant={pkg.is_active ? 'default' : 'secondary'}
                          >
                            {pkg.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {pkg.is_popular && (
                            <Badge variant='destructive'>Popular</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => openEditDialog(pkg)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDeletePackage(pkg.id)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Package Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Create New Package</DialogTitle>
              <DialogDescription>
                Add a new learning package to the system.
              </DialogDescription>
            </DialogHeader>
            <PackageForm formData={formData} setFormData={setFormData} />
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePackage}>Create Package</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Package Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Edit Package</DialogTitle>
              <DialogDescription>
                Update the package information.
              </DialogDescription>
            </DialogHeader>
            <PackageForm formData={formData} setFormData={setFormData} />
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePackage}>Update Package</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGate>
  );
}

// Package Form Component
function PackageForm({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: (data: any) => void;
}) {
  return (
    <div className='grid gap-4 py-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='title'>Title</Label>
          <Input
            id='title'
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder='e.g., 30 Minutes'
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='package_type'>Package Type</Label>
          <Select
            value={formData.package_type}
            onValueChange={(value) =>
              setFormData({ ...formData, package_type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='basic'>Basic</SelectItem>
              <SelectItem value='standard'>Standard</SelectItem>
              <SelectItem value='premium'>Premium</SelectItem>
              <SelectItem value='enterprise'>Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='description'>Description</Label>
        <Textarea
          id='description'
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder='Package description...'
        />
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='current_price'>Current Price</Label>
          <Input
            id='current_price'
            type='number'
            step='0.01'
            value={formData.current_price}
            onChange={(e) =>
              setFormData({ ...formData, current_price: e.target.value })
            }
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='original_price'>Original Price</Label>
          <Input
            id='original_price'
            type='number'
            step='0.01'
            value={formData.original_price}
            onChange={(e) =>
              setFormData({ ...formData, original_price: e.target.value })
            }
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='discount'>Discount</Label>
          <Input
            id='discount'
            value={formData.discount}
            onChange={(e) =>
              setFormData({ ...formData, discount: e.target.value })
            }
            placeholder='e.g., 15%'
          />
        </div>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='days'>Days per Week</Label>
          <Input
            id='days'
            type='number'
            min='1'
            max='7'
            value={formData.days}
            onChange={(e) =>
              setFormData({ ...formData, days: parseInt(e.target.value) })
            }
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='class_duration'>Class Duration (min)</Label>
          <Select
            value={formData.class_duration.toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, class_duration: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='30'>30 minutes</SelectItem>
              <SelectItem value='45'>45 minutes</SelectItem>
              <SelectItem value='60'>60 minutes</SelectItem>
              <SelectItem value='90'>90 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='total_classes'>Total Classes</Label>
          <Input
            id='total_classes'
            type='number'
            value={formData.total_classes}
            onChange={(e) =>
              setFormData({
                ...formData,
                total_classes: parseInt(e.target.value),
              })
            }
          />
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='subject'>Subject</Label>
          <Input
            id='subject'
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            placeholder='e.g., English, Math'
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='level'>Level</Label>
          <Select
            value={formData.level}
            onValueChange={(value) =>
              setFormData({ ...formData, level: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Beginner'>Beginner</SelectItem>
              <SelectItem value='Intermediate'>Intermediate</SelectItem>
              <SelectItem value='Advanced'>Advanced</SelectItem>
              <SelectItem value='Expert'>Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='features'>Features (comma separated)</Label>
        <Textarea
          id='features'
          value={formData.features}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ ...formData, features: e.target.value })
          }
          placeholder='1-on-1 sessions, Homework support, Progress tracking'
        />
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='subscription_frequency'>Frequency</Label>
          <Select
            value={formData.subscription_frequency}
            onValueChange={(value) =>
              setFormData({ ...formData, subscription_frequency: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='weekly'>Weekly</SelectItem>
              <SelectItem value='monthly'>Monthly</SelectItem>
              <SelectItem value='quarterly'>Quarterly</SelectItem>
              <SelectItem value='yearly'>Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='currency'>Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) =>
              setFormData({ ...formData, currency: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='USD'>USD</SelectItem>
              <SelectItem value='EUR'>EUR</SelectItem>
              <SelectItem value='GBP'>GBP</SelectItem>
              <SelectItem value='CAD'>CAD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='sort_order'>Sort Order</Label>
          <Input
            id='sort_order'
            type='number'
            value={formData.sort_order}
            onChange={(e) =>
              setFormData({ ...formData, sort_order: parseInt(e.target.value) })
            }
          />
        </div>
      </div>

      <div className='flex items-center space-x-4'>
        <div className='flex items-center space-x-2'>
          <Switch
            id='is_popular'
            checked={formData.is_popular}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_popular: checked })
            }
          />
          <Label htmlFor='is_popular'>Popular Package</Label>
        </div>
        <div className='flex items-center space-x-2'>
          <Switch
            id='is_active'
            checked={formData.is_active}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_active: checked })
            }
          />
          <Label htmlFor='is_active'>Active</Label>
        </div>
      </div>
    </div>
  );
}
