import {createClient} from "@supabase/supabase-js";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";

function client() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true
            }
        }
    )
}
export const supabase = client()
export const supabaseClient = createClientComponentClient()