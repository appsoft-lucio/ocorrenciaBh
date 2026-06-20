import { useMemo, useState, type FormEvent } from "react";
import AppLayout from "../components/layout/AppLayout";
import { loadOccurrences } from "../services/occurrenceStorage";
import { loadStores, saveStores, type Store } from "../services/storeStorage";

type StoreForm = Omit<Store, "id">;

const emptyForm: StoreForm = {
  code: "",
  name: "",
  city: "",
  address: "",
  regional: "",
  manager: "",
  phone: "",
  email: "",
  employees: 0,
  openingHours: "",
  status: "Ativa",
};

export default function Stores() {
  const [stores, setStores] = useState<Store[]>(loadStores);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todas");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const occurrences = useMemo(() => loadOccurrences(), []);

  const filteredStores = useMemo(() => {
    const term = search.toLowerCase().trim();
    return stores.filter((store) => {
      const matchesStatus =
        statusFilter === "Todas" || store.status === statusFilter;
      const matchesSearch =
        !term ||
        [
          store.code,
          store.name,
          store.city,
          store.regional,
          store.manager,
        ].some((value) => value.toLowerCase().includes(term));

      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter, stores]);

  const selectedStore = stores.find((store) => store.id === selectedStoreId);
  const selectedOccurrences = selectedStore
    ? occurrences.filter(
        (occurrence) => occurrence.store === selectedStore.name,
      )
    : [];

  const summary = useMemo(
    () => ({
      total: stores.length,
      active: stores.filter((store) => store.status === "Ativa").length,
      inactive: stores.filter((store) => store.status === "Inativa").length,
      employees: stores.reduce((total, store) => total + store.employees, 0),
    }),
    [stores],
  );

  function persist(nextStores: Store[]) {
    try {
      saveStores(nextStores);
      setStores(nextStores);
      return true;
    } catch {
      setMessage("Não foi possível salvar os dados da loja.");
      return false;
    }
  }

  function openNewStore() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function editStore(store: Store) {
    setEditingId(store.id);
    setForm({
      code: store.code,
      name: store.name,
      city: store.city,
      address: store.address,
      regional: store.regional,
      manager: store.manager,
      phone: store.phone,
      email: store.email,
      employees: store.employees,
      openingHours: store.openingHours,
      status: store.status,
    });
    setShowForm(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.code || !form.name || !form.city || !form.manager) {
      setMessage("Preencha código, nome, cidade e gerente.");
      return;
    }

    const duplicateCode = stores.some(
      (store) => store.code === form.code && store.id !== editingId,
    );
    if (duplicateCode) {
      setMessage("Já existe uma loja cadastrada com esse código.");
      return;
    }

    const nextStores = editingId
      ? stores.map((store) =>
          store.id === editingId ? { ...store, ...form } : store,
        )
      : [{ id: `store-${Date.now()}`, ...form }, ...stores];

    if (persist(nextStores)) {
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setMessage(
        editingId
          ? "Loja atualizada com sucesso."
          : "Loja cadastrada com sucesso.",
      );
    }
  }

  function toggleStatus(store: Store) {
    const status = store.status === "Ativa" ? "Inativa" : "Ativa";
    if (
      persist(
        stores.map((item) =>
          item.id === store.id ? { ...item, status } : item,
        ),
      )
    ) {
      setMessage(`Loja marcada como ${status.toLowerCase()}.`);
    }
  }

  return (
    <AppLayout title="Lojas">
      {message && (
        <div
          className="notification-overlay"
          role="presentation"
          onClick={() => setMessage("")}
        >
          <div
            className="page-notification"
            role="alertdialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="notification-icon" aria-hidden="true">
              !
            </span>
            <p>{message}</p>
            <button type="button" onClick={() => setMessage("")}>
              Entendi
            </button>
          </div>
        </div>
      )}

      <section className="store-summary">
        <article>
          <span>🏪</span>
          <div>
            <strong>{summary.total}</strong>
            <p>Lojas cadastradas</p>
          </div>
        </article>
        <article>
          <span>✅</span>
          <div>
            <strong>{summary.active}</strong>
            <p>Lojas ativas</p>
          </div>
        </article>
        <article>
          <span>⏸️</span>
          <div>
            <strong>{summary.inactive}</strong>
            <p>Lojas inativas</p>
          </div>
        </article>
        <article>
          <span>👥</span>
          <div>
            <strong>{summary.employees}</strong>
            <p>Colaboradores</p>
          </div>
        </article>
      </section>

      <section className="stores-toolbar">
        <div>
          <h2>Unidades</h2>
          <p>Cadastre e acompanhe as lojas da rede.</p>
        </div>
        <button className="primary-button" type="button" onClick={openNewStore}>
          + Nova loja
        </button>
      </section>

      <section className="stores-filters">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          type="search"
          placeholder="Pesquisar código, loja, cidade ou gerente..."
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option>Todas</option>
          <option>Ativa</option>
          <option>Inativa</option>
        </select>
      </section>

      <section className="stores-table-card">
        <div className="stores-table-wrap">
          <table className="stores-table">
            <thead>
              <tr>
                <th>LOJA</th>
                <th>CIDADE / REGIONAL</th>
                <th>GERENTE</th>
                <th>COLABORADORES</th>
                <th>STATUS</th>
                <th>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.map((store) => (
                <tr key={store.id}>
                  <td>
                    <strong>{store.name}</strong>
                    <small>Código {store.code}</small>
                  </td>
                  <td>
                    <strong>{store.city}</strong>
                    <small>{store.regional}</small>
                  </td>
                  <td>{store.manager}</td>
                  <td>{store.employees}</td>
                  <td>
                    <span
                      className={`store-status ${store.status.toLowerCase()}`}
                    >
                      {store.status}
                    </span>
                  </td>
                  <td>
                    <div className="store-actions">
                      <button
                        type="button"
                        onClick={() => setSelectedStoreId(store.id)}
                      >
                        Detalhes
                      </button>
                      <button type="button" onClick={() => editStore(store)}>
                        Editar
                      </button>
                      <button type="button" onClick={() => toggleStatus(store)}>
                        {store.status === "Ativa" ? "Inativar" : "Ativar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filteredStores.length && (
          <p className="dashboard-empty">Nenhuma loja encontrada.</p>
        )}
      </section>

      {showForm && (
        <div className="store-modal-overlay">
          <section
            className="store-modal"
            role="dialog"
            aria-modal="true"
            aria-label={editingId ? "Editar loja" : "Nova loja"}
          >
            <div className="store-modal-header">
              <div>
                <h2>{editingId ? "Editar loja" : "Nova loja"}</h2>
                <p>Informe os dados da unidade.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Código *
                  <input
                    value={form.code}
                    onChange={(event) =>
                      setForm({ ...form, code: event.target.value })
                    }
                    placeholder="Ex.: 142"
                  />
                </label>
                <label>
                  Nome da unidade *
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="Ex.: Loja 142"
                  />
                </label>
                <label>
                  Cidade *
                  <input
                    value={form.city}
                    onChange={(event) =>
                      setForm({ ...form, city: event.target.value })
                    }
                  />
                </label>
                <label>
                  Regional
                  <input
                    value={form.regional}
                    onChange={(event) =>
                      setForm({ ...form, regional: event.target.value })
                    }
                  />
                </label>
              </div>
              <label>
                Endereço
                <input
                  value={form.address}
                  onChange={(event) =>
                    setForm({ ...form, address: event.target.value })
                  }
                />
              </label>
              <div className="form-grid">
                <label>
                  Gerente responsável *
                  <input
                    value={form.manager}
                    onChange={(event) =>
                      setForm({ ...form, manager: event.target.value })
                    }
                  />
                </label>
                <label>
                  Telefone
                  <input
                    value={form.phone}
                    onChange={(event) =>
                      setForm({ ...form, phone: event.target.value })
                    }
                  />
                </label>
                <label>
                  E-mail
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                  />
                </label>
                <label>
                  Colaboradores
                  <input
                    min="0"
                    type="number"
                    value={form.employees}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        employees: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Funcionamento
                  <input
                    value={form.openingHours}
                    onChange={(event) =>
                      setForm({ ...form, openingHours: event.target.value })
                    }
                    placeholder="07:00 às 22:00"
                  />
                </label>
                <label>
                  Status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status: event.target.value as Store["status"],
                      })
                    }
                  >
                    <option>Ativa</option>
                    <option>Inativa</option>
                  </select>
                </label>
              </div>
              <div className="store-modal-actions">
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button className="primary-button" type="submit">
                  Salvar loja
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedStore && (
        <div className="store-modal-overlay">
          <section
            className="store-modal store-details"
            role="dialog"
            aria-modal="true"
            aria-label="Detalhes da loja"
          >
            <div className="store-modal-header">
              <div>
                <h2>{selectedStore.name}</h2>
                <p>
                  {selectedStore.city} • {selectedStore.regional}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStoreId(null)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <div className="store-detail-grid">
              <div>
                <span>Gerente</span>
                <strong>{selectedStore.manager}</strong>
              </div>
              <div>
                <span>Colaboradores</span>
                <strong>{selectedStore.employees}</strong>
              </div>
              <div>
                <span>Telefone</span>
                <strong>{selectedStore.phone || "Não informado"}</strong>
              </div>
              <div>
                <span>Funcionamento</span>
                <strong>{selectedStore.openingHours || "Não informado"}</strong>
              </div>
            </div>
            <div className="store-address">
              <span>Endereço</span>
              <strong>{selectedStore.address || "Não informado"}</strong>
            </div>
            <h3>Ocorrências da unidade</h3>
            <div className="store-occurrence-summary">
              <article>
                <strong>{selectedOccurrences.length}</strong>
                <span>Total</span>
              </article>
              <article>
                <strong>
                  {
                    selectedOccurrences.filter(
                      (item) => item.status === "Aberta",
                    ).length
                  }
                </strong>
                <span>Abertas</span>
              </article>
              <article>
                <strong>
                  {
                    selectedOccurrences.filter(
                      (item) => item.priority === "Crítica",
                    ).length
                  }
                </strong>
                <span>Críticas</span>
              </article>
              <article>
                <strong>
                  {
                    selectedOccurrences.filter(
                      (item) => item.status === "Resolvida",
                    ).length
                  }
                </strong>
                <span>Resolvidas</span>
              </article>
            </div>

            <div className="store-occurrence-list">
              {selectedOccurrences.slice(0, 5).map((occurrence) => (
                <div key={occurrence.id}>
                  <div>
                    <strong>{occurrence.title}</strong>
                    <span>
                      {occurrence.sector} • {occurrence.status}
                    </span>
                  </div>
                  <small>{occurrence.date}</small>
                </div>
              ))}
              {!selectedOccurrences.length && (
                <p className="dashboard-empty">
                  Nenhuma ocorrência nesta loja.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </AppLayout>
  );
}
