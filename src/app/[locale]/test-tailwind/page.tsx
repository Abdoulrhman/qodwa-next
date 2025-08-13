export default function TailwindTest() {
  return (
    <div className='p-8 bg-blue-500 text-white'>
      <h1 className='text-3xl font-bold mb-4'>Tailwind Test Page</h1>
      <div className='grid grid-cols-2 gap-4'>
        <div className='bg-red-500 p-4 rounded-lg'>
          <p className='text-sm'>Red Card</p>
        </div>
        <div className='bg-green-500 p-4 rounded-lg'>
          <p className='text-sm'>Green Card</p>
        </div>
      </div>
      <button className='mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors'>
        Test Button
      </button>
    </div>
  );
}
