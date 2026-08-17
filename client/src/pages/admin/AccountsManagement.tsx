import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, ShieldCheck, Trash2, UserRound, UsersRound } from 'lucide-react';
import { authService } from '../../services/authService';
import useAuth from '../../hooks/useAuth';
import Loading from '../../components/common/Loading';
import { useToast } from '../../components/common/Toast';
import { formatDate } from '../../utils/formatDate';

export const AccountsManagement = () => {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const { data, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: () => authService.getUsers() });
  const users = data?.data || [];
  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((user) => [user.fullName, user.email, user.phone].some((value) => value?.toLowerCase().includes(keyword)));
  }, [search, users]);

  const roleMutation = useMutation<any, Error, { id: string; role: 'admin' | 'user' }>({
    mutationFn: ({ id, role }) => authService.updateUserRole(id, role),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(response.message);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation<any, Error, string>({
    mutationFn: (id) => authService.deleteUser(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(response.message);
    },
    onError: (error) => toast.error(error.message),
  });

  const handleDelete = (account) => {
    if (window.confirm(`Bạn có chắc muốn xóa tài khoản “${account.fullName}”? Thao tác này không thể hoàn tác.`)) {
      deleteMutation.mutate(account._id);
    }
  };

  if (isLoading) return <Loading fullScreen text="Đang tải danh sách tài khoản..." />;

  const adminCount = users.filter((user) => user.role === 'admin').length;
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson uppercase tracking-wider mb-1"><ShieldCheck className="w-4 h-4" /> Phân quyền hệ thống</div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-white">Quản Lý Tài Khoản</h1>
          <p className="text-xs text-ink-muted mt-1">Cấp quyền Admin hoặc User cho từng tài khoản đã đăng ký.</p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-ink-light dark:text-gray-200"><UsersRound className="w-4 h-4 text-crimson" /> {users.length} tài khoản · {adminCount} quản trị viên</div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên, email hoặc số điện thoại..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand dark:border-white/10 bg-porcelain-card dark:bg-ink-card text-sm text-ink dark:text-white outline-none focus:border-crimson" />
      </div>

      <div className="overflow-x-auto rounded-3xl border border-sand dark:border-white/10 bg-porcelain-card dark:bg-ink-card shadow-warm">
        <table className="w-full min-w-[840px] text-left text-xs">
          <thead className="bg-sand-light/70 dark:bg-ink-deep text-ink-muted uppercase tracking-wider text-[11px]"><tr><th className="px-5 py-4">Tài khoản</th><th className="px-4 py-4">Liên hệ</th><th className="px-4 py-4">Ngày tạo</th><th className="px-4 py-4 text-center">Vai trò</th><th className="px-5 py-4 text-right">Cấp quyền</th><th className="px-5 py-4 text-right">Xóa</th></tr></thead>
          <tbody className="divide-y divide-sand/60 dark:divide-white/10">
            {filteredUsers.map((account) => {
              const isCurrentUser = account._id === currentUser?._id;
              const updating = (roleMutation.isPending && roleMutation.variables?.id === account._id) || (deleteMutation.isPending && deleteMutation.variables === account._id);
              return <tr key={account._id} className="hover:bg-sand-light/30 dark:hover:bg-white/5">
                <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-crimson-light dark:bg-crimson/25 text-crimson dark:text-rose-300 flex items-center justify-center font-bold"><UserRound className="w-4 h-4" /></div><div><p className="font-bold text-ink dark:text-white">{account.fullName}{isCurrentUser && <span className="ml-2 text-[10px] text-crimson">(Bạn)</span>}</p><p className="text-ink-muted mt-0.5">{account.email}</p></div></div></td>
                <td className="px-4 py-4 text-ink-light dark:text-gray-300">{account.phone}</td><td className="px-4 py-4 text-ink-muted">{formatDate(account.createdAt)}</td>
                <td className="px-4 py-4 text-center"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold ${account.role === 'admin' ? 'bg-crimson-light dark:bg-crimson/25 text-crimson dark:text-rose-300' : 'bg-sage-light dark:bg-sage/20 text-sage-deep dark:text-sage'}`}>{account.role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserRound className="w-3.5 h-3.5" />}{account.role === 'admin' ? 'Admin' : 'User'}</span></td>
                <td className="px-5 py-4 text-right"><select value={account.role} disabled={updating || isCurrentUser} onChange={(event) => roleMutation.mutate({ id: account._id, role: event.target.value as 'admin' | 'user' })} className="rounded-lg border border-sand dark:border-white/15 bg-porcelain dark:bg-ink-deep px-2.5 py-1.5 font-semibold text-ink dark:text-white outline-none focus:border-crimson disabled:opacity-60"><option value="user">User</option><option value="admin">Admin</option></select></td>
                <td className="px-5 py-4 text-right"><button type="button" disabled={updating || isCurrentUser} onClick={() => handleDelete(account)} title={isCurrentUser ? 'Không thể xóa tài khoản đang đăng nhập' : `Xóa ${account.fullName}`} className="inline-flex items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/60 p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 className="w-4 h-4" /></button></td>
              </tr>;
            })}
          </tbody>
        </table>
        {!filteredUsers.length && <p className="p-10 text-center text-sm text-ink-muted">Không tìm thấy tài khoản phù hợp.</p>}
      </div>
    </div>
  );
};

export default AccountsManagement;
