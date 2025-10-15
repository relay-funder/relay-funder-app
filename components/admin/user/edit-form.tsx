'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Textarea,
  Button,
  Separator,
  Checkbox,
} from '@/components/ui';

import {
  useAdminUser,
  useUpdateAdminUser,
  useUpdateAdminUserFlags,
  useUpdateAdminUserRoles,
} from '@/lib/hooks/useAdminUsers';
import {
  PatchUserRouteBodySchema,
  type PatchUserRouteBody,
} from '@/lib/api/types/admin';

import { USER_FLAG_GROUPS } from '@/lib/constant/user-flags';
import { toast } from '@/hooks/use-toast';
const AdminUserEditSchema = PatchUserRouteBodySchema.extend({
  // UI-only fields
  roleUser: z.boolean().optional(),
  roleAdmin: z.boolean().optional(),
  selectedFlags: z.array(z.string()).optional(),
  preservedUnknownFlags: z.array(z.string()).optional(),

  // Permit blank strings for email/username in the form layer
  email: z.union([z.string().email(), z.literal('')]).optional(),
  username: z.union([z.string().min(5), z.literal('')]).optional(),
});

type AdminUserEditFormValues = z.infer<typeof AdminUserEditSchema>;

function genUuidEmail(): string {
  try {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return `${crypto.randomUUID()}@localhost`;
    }
  } catch {
    // ignore and fallback
  }
  const rand = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');
  return `${rand}@localhost`;
}

function randomLetters(count: number): string {
  const letters: string[] = [];
  try {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.getRandomValues === 'function'
    ) {
      const arr = new Uint8Array(count);
      crypto.getRandomValues(arr);
      for (let i = 0; i < arr.length; i++) {
        letters.push(String.fromCharCode(97 + (arr[i] % 26)));
      }
      return letters.join('');
    }
  } catch {
    // ignore and fallback
  }
  for (let i = 0; i < count; i++) {
    letters.push(String.fromCharCode(97 + Math.floor(Math.random() * 26)));
  }
  return letters.join('');
}

function genUsername(): string {
  return `user_${randomLetters(8)}`;
}

export function AdminUserEditForm({ address }: { address: string }) {
  const router = useRouter();
  const { data: user, isLoading, isError, error } = useAdminUser(address);

  const { mutateAsync: updateUserAsync, isPending: isUpdatingUser } =
    useUpdateAdminUser();
  const { mutateAsync: updateFlagsAsync, isPending: isUpdatingFlags } =
    useUpdateAdminUserFlags();
  const { mutateAsync: updateRolesAsync, isPending: isUpdatingRoles } =
    useUpdateAdminUserRoles();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const isSubmitting = isUpdatingUser || isUpdatingFlags || isUpdatingRoles;

  const form = useForm<AdminUserEditFormValues>({
    resolver: zodResolver(AdminUserEditSchema),
    defaultValues: {
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      bio: '',
      recipientWallet: '',
      roleUser: false,
      roleAdmin: false,
      selectedFlags: [],
      preservedUnknownFlags: [],
    },
    mode: 'onBlur',
  });

  // When the user loads, seed the form with values from the server
  useEffect(() => {
    if (!user) return;
    const currentFlags = Array.isArray(user.featureFlags)
      ? user.featureFlags
      : [];
    const knownSet = new Set(USER_FLAG_GROUPS.flatMap((g) => g.items));
    const currentKnownFlags = currentFlags.filter((f) => knownSet.has(f));
    const currentUnknownFlags = currentFlags.filter((f) => !knownSet.has(f));
    form.reset({
      email: user.email ?? '',
      username: user.username ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      bio: user.bio ?? '',
      recipientWallet: user.recipientWallet ?? '',
      roleUser: Array.isArray(user.roles) ? user.roles.includes('user') : false,
      roleAdmin: Array.isArray(user.roles)
        ? user.roles.includes('admin')
        : false,
      selectedFlags: currentKnownFlags,
      preservedUnknownFlags: currentUnknownFlags,
    });
  }, [user, form]);

  const pendingText = useMemo(() => {
    const parts: string[] = [];
    if (isUpdatingUser) parts.push('profile');
    if (isUpdatingFlags) parts.push('flags');
    if (isUpdatingRoles) parts.push('roles');
    if (parts.length === 0) return '';
    return `Saving ${parts.join(', ')}...`;
  }, [isUpdatingUser, isUpdatingFlags, isUpdatingRoles]);

  const onSubmit = useCallback(
    async (values: AdminUserEditFormValues) => {
      setSubmitError(null);
      const patch: PatchUserRouteBody = {
        email: values.email?.trim()
          ? values.email.trim()
          : undefined /* omit empty */,
        username: values.username?.trim()
          ? values.username.trim()
          : undefined /* omit empty */,
        firstName:
          values.firstName === undefined
            ? undefined
            : values.firstName?.trim()
              ? values.firstName.trim()
              : null,
        lastName:
          values.lastName === undefined
            ? undefined
            : values.lastName?.trim()
              ? values.lastName.trim()
              : null,
        bio:
          values.bio === undefined
            ? undefined
            : values.bio?.trim()
              ? values.bio.trim()
              : null,
        recipientWallet:
          values.recipientWallet === undefined
            ? undefined
            : values.recipientWallet?.trim()
              ? values.recipientWallet.trim()
              : null,
      };

      const flags = Array.from(
        new Set([
          ...(values.preservedUnknownFlags ?? []),
          ...(values.selectedFlags ?? []),
        ]),
      );

      // Preserve any existing roles other than 'user'/'admin'
      const preserved = Array.isArray(user?.roles)
        ? user.roles.filter((r) => r !== 'user' && r !== 'admin')
        : [];
      const selected: string[] = [];
      if (values.roleUser) selected.push('user');
      if (values.roleAdmin) selected.push('admin');
      const roles = Array.from(new Set([...preserved, ...selected]));

      try {
        // Update core fields, then flags/roles
        await updateUserAsync({ address, data: patch });
        await Promise.all([
          updateFlagsAsync({ address, flags }),
          updateRolesAsync({ address, roles }),
        ]);
        toast({
          title: 'User updated',
          description: 'Profile, roles, and flags saved successfully.',
        });
        setTimeout(() => {
          router.push(`/admin/users/${encodeURIComponent(address)}`);
        }, 1000);
      } catch (e) {
        const msg =
          (e as Error)?.message ||
          'Failed to update the user. Please try again.';
        setSubmitError(msg);
        return;
      }
    },
    [
      user?.roles,
      updateUserAsync,
      address,
      updateFlagsAsync,
      updateRolesAsync,
      router,
    ],
  );

  if (isLoading) {
    return (
      <div className="rounded-md border p-6 text-sm text-muted-foreground">
        Loading user...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {(error as Error)?.message || 'Failed to load user'}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-md border p-6 text-sm text-muted-foreground">
        User not found.
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 rounded-md border p-4"
      >
        <div>
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Edit the user’s profile details and KYC status.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      {...field}
                      value={field.value ?? ''}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const v = genUuidEmail();
                        form.setValue('email', v, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="username"
                      {...field}
                      value={field.value ?? ''}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const v = genUsername();
                        form.setValue('username', v, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="First name"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recipientWallet"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Recipient wallet</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0x..."
                    spellCheck={false}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Short user bio..."
                      rows={4}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">Roles</h3>
            <p className="text-xs text-muted-foreground">
              {Array.isArray(user.roles) &&
              user.roles.filter((r) => r !== 'user' && r !== 'admin').length
                ? `Other roles (preserved): ${user.roles.filter((r) => r !== 'user' && r !== 'admin').join(', ')}`
                : 'Select one or more roles below.'}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="roleUser"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(Boolean(checked))
                      }
                    />
                  </FormControl>
                  <FormLabel>User</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleAdmin"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(Boolean(checked))
                      }
                    />
                  </FormControl>
                  <FormLabel>Admin</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">Feature flags</h3>
            <p className="text-xs text-muted-foreground">
              {Array.isArray(form.watch('preservedUnknownFlags')) &&
              form.watch('preservedUnknownFlags')!.length
                ? `Other flags (preserved): ${form.watch('preservedUnknownFlags')!.join(', ')}`
                : 'Select one or more flags below.'}
            </p>
          </div>
          <div className="space-y-3">
            {USER_FLAG_GROUPS.map((group) => {
              const selected = form.watch('selectedFlags') || [];
              return (
                <div key={group.key} className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((flag) => (
                      <label key={flag} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selected.includes(flag)}
                          onCheckedChange={(checked) => {
                            const set = new Set(selected);
                            if (checked) set.add(flag);
                            else set.delete(flag);
                            form.setValue('selectedFlags', Array.from(set), {
                              shouldDirty: true,
                            });
                          }}
                        />
                        <span className="text-sm">{flag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {submitError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? pendingText || 'Saving...' : 'Save changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default AdminUserEditForm;
