const SteelTable = ({ steels, title }) => (
  <div className="container mx-auto px-4 mt-8">
    <h3 className="text-xl font-semibold text-spydercoRed mb-2">
      Top 5 {title} Recommendations:
    </h3>
    <div className="w-4/5 mx-auto overflow-x-auto rounded-xl shadow-lg border border-white/10">

      <table className="min-w-full mx-auto border-separate border-spacing-y-1 text-sm">

        <thead>
          <tr className="bg-spydercoRed text-white uppercase text-xs tracking-wider">
            <th className="px-4 py-3 text-left rounded-tl-xl">Steel Name</th>
            <th className="px-4 py-3 text-left">Toughness</th>
            <th className="px-4 py-3 text-left">Edge Retention</th>
            <th className="px-4 py-3 text-left rounded-tr-xl">Corrosion Resitance</th>
          </tr>
        </thead>
        <tbody>
          {steels.map((steel, i) => (
            <tr
              key={i}
              className="bg-zinc-900 hover:bg-zinc-800 transition duration-150 rounded-lg"
            >
              <td className="px-4 py-3 border-b border-white/10">{steel.name}</td>
              <td className="px-4 py-3 border-b border-white/10">{steel.toughness}</td>
              <td className="px-4 py-3 border-b border-white/10">{steel.edgeRetention}</td>
              <td className="px-4 py-3 border-b border-white/10">{steel.corrosion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default SteelTable
