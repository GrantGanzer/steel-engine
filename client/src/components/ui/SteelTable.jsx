const SteelTable = ({ steels, title }) => (
  <div className="w-full mt-4 px-2">
    <div className="w-full rounded-xl border-spacing-1 border-white/10 ">
      <table className="w-full table-fixed text-sm leading-tight">
        <thead>
          <tr>
            <td
              colSpan={4}
              className="text-xl font-semibold text-white text-center bg-red-700 px-4 py-3 rounded-t-xl whitespace-nowrap"
            >
              Top 5 {title} Recommendations:
            </td>
          </tr>
          <tr className="bg-spydercoRed text-white uppercase text-xs tracking-wider">
            <th className="px-4 py-3 rounded-tl-xl">Steel Name</th>
            <th className="px-4 py-3 ">Toughness</th>
            <th className="px-4 py-3 ">Edge Retention</th>
            <th className="px-4 py-3  rounded-tr-xl">Corrosion Resitance</th>
          </tr>
        </thead>
        <tbody>
          {steels.map((steel, i) => (
            <tr
              key={i}
              onClick={() => window.open(`https://www.spyderco.com/catalog/category/everyday-carry`, "_blank")}
              // onClick={() => window.open(`https://www.bladehq.com/cat--Pocket-Knives--45#/filter:${encodeURIComponent(steel.name)}`, "_blank")}
              className="bg-zinc-900 hover:bg-zinc-800 transition duration-150 rounded-xl cursor-pointer"
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
