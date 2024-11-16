import { RouterProvider } from 'react-router-dom';
import router from "./router";
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <div className="block relative">
            <RouterProvider
                router={router}
            />
            <Toaster
                position='top-right'
                reverseOrder
            />
        </div>
    );
}

export default App;
