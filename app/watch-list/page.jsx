import { cookies } from "next/headers";
import WatchForm from "../components/WatchForm";
import EditWatch from "../components/EditWatch";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { deleteWatch } from "../server-actions/deleteWatch";

export default async function WatchList(){
    const cookieStore = await cookies();
    const supabase = createServerComponentClient({cookies: () =>  cookieStore});
    const {data: {session}} = await supabase.auth.getSession();
    const user = session?.user;

    const {data: watches, error} = await supabase
    .from('watches')
    .select('*')
    .eq('user_id', user.id)
    .order('brand', {ascending: true})
    
    if(error){
        console.error('Error Fetching Watches')
    }

    console.log({user})

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
        <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Watch List</h1>
            <form action="/auth/signout" method="post">
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg shadow">
                Sign Out
                </button>
            </form>
            </div>

            <div className="mb-6">
            <WatchForm />
            </div>

            <div className="space-y-4">
            {watches.map((watch) => (
                <div key={watch.id} className="bg-gray-700 p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">{watch.brand} - {watch.model}</h2>
                <div className="flex justify-between items-center mt-4">
                    <form action={deleteWatch}>
                    <input type="hidden" name="id" value={watch.id} />
                    <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg">
                        Delete
                    </button>
                    </form>
                    <EditWatch watch={watch} />
                </div>
                </div>
            ))}
            </div>
        </div>
        </div>
    )
}

