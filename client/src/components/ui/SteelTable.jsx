const SteelTable = ({ steels, title }) => (
  <div>
    <h3 className="text-lg font-bold">Top 5 {title} Recommendations:</h3>
    <table className="min-w-full table-auto">
      <thead>
        <tr>
          <th className="px-4 py-2 border">Steel Name</th>
          <th className="px-4 py-2 border">Toughness</th>
          <th className="px-4 py-2 border">Edge Retention</th>
          <th className="px-4 py-2 border">Corrosion Resistance</th>
        </tr>
      </thead>
      <tbody>
        {steels.map((steel, index) => (
          <tr key={index}>
            <td className="px-4 py-2 border">{steel.name}</td>
            <td className="px-4 py-2 border">{steel.toughness}</td>
            <td className="px-4 py-2 border">{steel.edgeRetention}</td>
            <td className="px-4 py-2 border">{steel.corrosion}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
export default SteelTable
