        // ✅ เรียก /games/admin/all เพื่อดึงทุกเกม รวมที่ปิดอยู่
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/games/admin/all`, { headers: { Authorization: `Bearer ${token}` } }),