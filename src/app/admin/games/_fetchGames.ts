        // ✅ ดึงทุกเกม รวมที่ปิดอยู่ (Admin endpoint)
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/games/admin/all`, { headers: { Authorization: `Bearer ${token}` } }),