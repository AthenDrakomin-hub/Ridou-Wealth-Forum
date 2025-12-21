/// <reference types="https://deno.land/x/deno@v1.37.0/cli/tsc/dts/lib.deno.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const svc = createClient(supabaseUrl, serviceRole, { 
  global: { headers: { Authorization: `Bearer ${serviceRole}` } } 
});

// 请求日志
function logRequest(method: string, path: string, userId?: string, success: boolean = true) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    method,
    path,
    userId,
    success,
    ip: 'edge-function'
  }));
}

async function handleListAdmins(req: Request) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'missing auth' }), { 
      status: 401, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  const token = auth.split(' ')[1];
  const { data: user, error: userErr } = await svc.auth.getUser(token);
  if (userErr || !user?.user) {
    logRequest('GET', '/admins', undefined, false);
    return new Response(JSON.stringify({ error: 'invalid token' }), { 
      status: 401, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  const uid = user.user.id;
  const { data: admins } = await svc.from('admin_users').select('role').eq('user_id', uid).limit(1);
  if (!admins || admins.length === 0 || admins[0].role !== 'super_admin') {
    logRequest('GET', '/admins', uid, false);
    return new Response(JSON.stringify({ error: 'forbidden: super_admin required' }), { 
      status: 403, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  const { data, error } = await svc.from('admin_users').select('id,user_id,email,role,permissions,created_at,updated_at');
  if (error) {
    logRequest('GET', '/admins', uid, false);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  logRequest('GET', '/admins', uid);
  return new Response(JSON.stringify(data), { 
    status: 200, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  });
}

async function handleCreateAdmin(req: Request) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'missing auth' }), { 
      status: 401, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  const token = auth.split(' ')[1];
  const { data: user, error: userErr } = await svc.auth.getUser(token);
  if (userErr || !user?.user) {
    logRequest('POST', '/admins', undefined, false);
    return new Response(JSON.stringify({ error: 'invalid token' }), { 
      status: 401, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  const uid = user.user.id;
  const { data: admins } = await svc.from('admin_users').select('role').eq('user_id', uid).limit(1);
  if (!admins || admins.length === 0 || admins[0].role !== 'super_admin') {
    logRequest('POST', '/admins', uid, false);
    return new Response(JSON.stringify({ error: 'forbidden: super_admin required' }), { 
      status: 403, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  const payload = await req.json();
  const { email, role = 'admin', permissions = {} } = payload;
  
  if (!email) {
    logRequest('POST', '/admins', uid, false);
    return new Response(JSON.stringify({ error: 'email required' }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  // 验证角色有效性
  if (!['admin', 'super_admin', 'moderator'].includes(role)) {
    logRequest('POST', '/admins', uid, false);
    return new Response(JSON.stringify({ error: 'invalid role' }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  const { data, error } = await svc.from('admin_users').insert([{ email, role, permissions }]).select().single();
  if (error) {
    logRequest('POST', '/admins', uid, false);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  logRequest('POST', '/admins', uid);
  return new Response(JSON.stringify(data), { 
    status: 201, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  });
}

async function handleUpdateAdmin(req: Request, id: string) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'missing auth' }), { 
      status: 401, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  const token = auth.split(' ')[1];
  const { data: user } = await svc.auth.getUser(token);
  const uid = user?.user?.id;
  
  if (!uid) {
    logRequest('PATCH', `/admins/${id}`, undefined, false);
    return new Response(JSON.stringify({ error: 'invalid token' }), { 
      status: 401, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  const { data: admins } = await svc.from('admin_users').select('role').eq('user_id', uid).limit(1);
  if (!admins || admins.length === 0 || admins[0].role !== 'super_admin') {
    logRequest('PATCH', `/admins/${id}`, uid, false);
    return new Response(JSON.stringify({ error: 'forbidden: super_admin required' }), { 
      status: 403, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  const payload = await req.json();
  const { role, permissions } = payload;
  const updates: any = {};
  
  if (role) {
    if (!['admin', 'super_admin', 'moderator'].includes(role)) {
      logRequest('PATCH', `/admins/${id}`, uid, false);
      return new Response(JSON.stringify({ error: 'invalid role' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    updates.role = role;
  }
  
  if (permissions) updates.permissions = permissions;
  updates.updated_at = new Date().toISOString();
  
  const { data, error } = await svc.from('admin_users').update(updates).eq('id', id).select().single();
  if (error) {
    logRequest('PATCH', `/admins/${id}`, uid, false);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  logRequest('PATCH', `/admins/${id}`, uid);
  return new Response(JSON.stringify(data), { 
    status: 200, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  });
}

async function handleDeleteAdmin(req: Request, id: string) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'missing auth' }), { 
      status: 401, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  const token = auth.split(' ')[1];
  const { data: user } = await svc.auth.getUser(token);
  const uid = user?.user?.id;
  
  if (!uid) {
    logRequest('DELETE', `/admins/${id}`, undefined, false);
    return new Response(JSON.stringify({ error: 'invalid token' }), { 
      status: 401, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  const { data: admins } = await svc.from('admin_users').select('role').eq('user_id', uid).limit(1);
  if (!admins || admins.length === 0 || admins[0].role !== 'super_admin') {
    logRequest('DELETE', `/admins/${id}`, uid, false);
    return new Response(JSON.stringify({ error: 'forbidden: super_admin required' }), { 
      status: 403, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  // 防止删除自己
  const { data: targetAdmin } = await svc.from('admin_users').select('user_id').eq('id', id).single();
  if (targetAdmin?.user_id === uid) {
    logRequest('DELETE', `/admins/${id}`, uid, false);
    return new Response(JSON.stringify({ error: 'cannot delete yourself' }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  const { error } = await svc.from('admin_users').delete().eq('id', id);
  if (error) {
    logRequest('DELETE', `/admins/${id}`, uid, false);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  logRequest('DELETE', `/admins/${id}`, uid);
  return new Response(JSON.stringify({ success: true }), { 
    status: 200, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  });
}

Deno.serve(async (req: Request) => {
  // CORS 预检
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  const url = new URL(req.url);
  const pathname = url.pathname.replace(/^\/+/, '');
  
  try {
    if (req.method === 'GET' && pathname === 'admin-management/admins') return handleListAdmins(req);
    if (req.method === 'POST' && pathname === 'admin-management/admins') return handleCreateAdmin(req);
    
    const match = pathname.match(/^admin-management\/admins\/(.+)$/);
    if (match) {
      const adminId = match[1];
      if (req.method === 'PATCH' || req.method === 'PUT') return handleUpdateAdmin(req, adminId);
      if (req.method === 'DELETE') return handleDeleteAdmin(req, adminId);
    }
    
    return new Response(JSON.stringify({ error: 'Not Found' }), { 
      status: 404, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (err: any) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Internal Server Error' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});