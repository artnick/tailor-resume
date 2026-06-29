'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppNav } from '@/components/layout/app-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function VariantsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const variantsQuery = useQuery({
    queryKey: ['variants'],
    queryFn: api.listVariants,
  });

  const createMutation = useMutation({
    mutationFn: (baseVariantId?: string) =>
      api.createVariant({
        name: baseVariantId != null ? 'Cloned variant' : 'New variant',
        baseVariantId,
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['variants'] });
      router.push(`/variants/${data.variant.id}`);
    },
  });

  return (
    <div>
      <AppNav />
      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Variants</h1>
            <p className="text-sm text-muted-foreground">
              Tailored resumes for specific job applications.
            </p>
          </div>
          <Button
            onClick={() => createMutation.mutate(undefined)}
            disabled={createMutation.isPending}
          >
            New variant
          </Button>
        </div>

        <div className="grid gap-4">
          {variantsQuery.data?.map((variant) => (
            <Card key={variant.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    <Link
                      href={`/variants/${variant.id}`}
                      className="hover:underline"
                    >
                      {variant.name}
                    </Link>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Template: {variant.templateId}
                    {variant.isFavorite ? ' · Favorite' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/variants/${variant.id}`}>Edit</Link>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => createMutation.mutate(variant.id)}
                  >
                    Clone
                  </Button>
                </div>
              </CardHeader>
              {variant.targetCompany ? (
                <CardContent>
                  <p className="text-sm">Target: {variant.targetCompany}</p>
                </CardContent>
              ) : null}
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
