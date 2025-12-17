import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MessageSquare, Send, Paperclip, File, Image, FileText, Video, MoreVertical, Copy, Pencil, Trash2, X, Check } from 'lucide-react';
import { useAuth } from '../../contexts';
import { notaService, usuarioService } from '../../services';
import { Nota, Usuario } from '../../types';
import styles from './styles.module.css';

function formatMessageDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday =
    new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

  if (isToday) return 'Hoje';
  if (isYesterday) return 'Ontem';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getFileIcon(tipo: string) {
  if (tipo.startsWith('image/')) return <Image size={14} />;
  if (tipo.startsWith('video/')) return <Video size={14} />;
  if (tipo.includes('pdf') || tipo.includes('document')) return <FileText size={14} />;
  return <File size={14} />;
}

function isImageType(tipo: string): boolean {
  return tipo.startsWith('image/');
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Renderizar texto com menções destacadas
function renderTextWithMentions(text: string): React.ReactNode {
  if (!text) return null;

  // Regex para encontrar menções (@NomePessoa)
  const mentionRegex = /@(\w+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    // Texto antes da menção
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // A menção destacada
    parts.push(
      <span key={match.index} className={styles.mention}>
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  // Texto restante após a última menção
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

interface ArquivoSelecionado {
  file: File;
  preview?: string;
}

export function Notas() {
  const { usuario } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagemInput, setMensagemInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const [editandoNota, setEditandoNota] = useState<string | null>(null);
  const [editandoConteudo, setEditandoConteudo] = useState('');
  const [arquivosSelecionados, setArquivosSelecionados] = useState<ArquivoSelecionado[]>([]);
  const [imagemExpandida, setImagemExpandida] = useState<{ url: string; nome: string } | null>(null);

  // Menções
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mostrarMencoes, setMostrarMencoes] = useState(false);
  const [buscaMencao, setBuscaMencao] = useState('');
  const [posicaoCursor, setPosicaoCursor] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Carregar notas
  const loadNotas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notaService.listar();
      setNotas(data);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito inicial
  useEffect(() => {
    loadNotas();
  }, [loadNotas]);

  // Scroll para ultima mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notas]);

  // Polling para novas mensagens
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const novasNotas = await notaService.listar();
        if (novasNotas.length !== notas.length) {
          setNotas(novasNotas);
        }
      } catch (error) {
        // Silently ignore polling errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [notas.length]);

  // Carregar usuários para menções
  useEffect(() => {
    async function loadUsuarios() {
      try {
        const data = await usuarioService.listar();
        setUsuarios(data.filter(u => u.ativo));
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    }
    loadUsuarios();
  }, []);

  // Filtrar usuários para autocomplete de menções
  const usuariosFiltrados = useMemo(() => {
    if (!buscaMencao) return usuarios;
    const busca = buscaMencao.toLowerCase();
    return usuarios.filter(u =>
      u.nome.toLowerCase().includes(busca) ||
      u.email.toLowerCase().includes(busca)
    );
  }, [usuarios, buscaMencao]);

  // Detectar @ no input
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    setMensagemInput(value);
    setPosicaoCursor(cursorPos);

    // Verificar se está digitando uma menção
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Verificar se não há espaço após o @
      if (!textAfterAt.includes(' ')) {
        setBuscaMencao(textAfterAt);
        setMostrarMencoes(true);
        return;
      }
    }

    setMostrarMencoes(false);
    setBuscaMencao('');
  }

  // Selecionar usuário para menção
  function handleSelecionarMencao(user: Usuario) {
    const textBeforeCursor = mensagemInput.substring(0, posicaoCursor);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const textAfterCursor = mensagemInput.substring(posicaoCursor);

    const newText =
      mensagemInput.substring(0, lastAtIndex) +
      `@${user.nome.split(' ')[0]} ` +
      textAfterCursor;

    setMensagemInput(newText);
    setMostrarMencoes(false);
    setBuscaMencao('');
    textareaRef.current?.focus();
  }

  // Enviar mensagem
  async function handleEnviarMensagem() {
    if (!mensagemInput.trim() && arquivosSelecionados.length === 0) return;

    try {
      setEnviando(true);

      // Criar a nota com o conteúdo (ou mensagem padrão se só tiver anexos)
      const conteudo = mensagemInput.trim() || (arquivosSelecionados.length > 0 ? '' : '');
      const novaNota = await notaService.criar({ conteudo });

      // Fazer upload dos arquivos e adicionar como anexos
      if (arquivosSelecionados.length > 0) {
        for (const arquivo of arquivosSelecionados) {
          try {
            const uploadResult = await notaService.uploadArquivo(arquivo.file);
            await notaService.adicionarAnexo(novaNota.id, {
              nome: uploadResult.nome,
              tipo: uploadResult.tipo,
              tamanho: uploadResult.tamanho,
              url: uploadResult.url,
            });
          } catch (uploadError) {
            console.error('Erro ao fazer upload do arquivo:', uploadError);
          }
        }

        // Limpar previews
        arquivosSelecionados.forEach((arq) => {
          if (arq.preview) URL.revokeObjectURL(arq.preview);
        });
        setArquivosSelecionados([]);
      }

      // Recarregar notas para ter os anexos atualizados
      await loadNotas();
      setMensagemInput('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setEnviando(false);
    }
  }

  // Copiar mensagem
  function handleCopiar(conteudo: string) {
    navigator.clipboard.writeText(conteudo);
    setMenuAberto(null);
  }

  // Iniciar edição
  function handleIniciarEdicao(nota: Nota) {
    setEditandoNota(nota.id);
    setEditandoConteudo(nota.conteudo);
    setMenuAberto(null);
  }

  // Cancelar edição
  function handleCancelarEdicao() {
    setEditandoNota(null);
    setEditandoConteudo('');
  }

  // Salvar edição
  async function handleSalvarEdicao(id: string) {
    if (!editandoConteudo.trim()) return;

    try {
      const notaAtualizada = await notaService.atualizar(id, editandoConteudo.trim());
      setNotas((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...notaAtualizada } : n))
      );
      setEditandoNota(null);
      setEditandoConteudo('');
    } catch (error) {
      console.error('Erro ao editar mensagem:', error);
    }
  }

  // Excluir mensagem
  async function handleExcluir(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta mensagem?')) return;

    try {
      await notaService.excluir(id);
      setNotas((prev) => prev.filter((n) => n.id !== id));
      setMenuAberto(null);
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error);
    }
  }

  // Abrir seletor de arquivos
  function handleAbrirSeletorArquivo() {
    fileInputRef.current?.click();
  }

  // Processar arquivos selecionados
  function handleArquivoSelecionado(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const novosArquivos: ArquivoSelecionado[] = Array.from(files).map((file) => {
      const arquivo: ArquivoSelecionado = { file };
      if (file.type.startsWith('image/')) {
        arquivo.preview = URL.createObjectURL(file);
      }
      return arquivo;
    });

    setArquivosSelecionados((prev) => [...prev, ...novosArquivos]);

    // Limpar input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  // Remover arquivo da lista
  function handleRemoverArquivo(index: number) {
    setArquivosSelecionados((prev) => {
      const arquivo = prev[index];
      if (arquivo.preview) {
        URL.revokeObjectURL(arquivo.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  // Agrupar notas por data
  const notasAgrupadas = notas.reduce<{ data: string; notas: Nota[] }[]>(
    (grupos, nota) => {
      const dataStr = new Date(nota.data_envio).toDateString();
      const grupoExistente = grupos.find((g) => g.data === dataStr);
      if (grupoExistente) {
        grupoExistente.notas.push(nota);
      } else {
        grupos.push({ data: dataStr, notas: [nota] });
      }
      return grupos;
    },
    []
  );

  return (
    <div className={styles.container}>
      {/* Header da página */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Notas</h1>
          <p className={styles.subtitle}>Chat interno da equipe</p>
        </div>
      </div>

      {/* Chat Card */}
      <div className={styles.chatCard}>
        {/* Messages Area */}
        <div className={styles.messagesArea}>
        {loading ? (
          <div className={styles.loading}>Carregando...</div>
        ) : notasAgrupadas.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare size={48} />
            <h3>Nenhuma nota ainda</h3>
            <p>Envie a primeira mensagem para iniciar a conversa</p>
          </div>
        ) : (
          notasAgrupadas.map((grupo) => (
            <div key={grupo.data}>
              <div className={styles.dateGroup}>
                <span className={styles.dateLabel}>
                  {formatFullDate(grupo.notas[0].data_envio)}
                </span>
              </div>
              {grupo.notas.map((nota, index) => {
                const isOwn = nota.autor_id === usuario?.id;
                const isEditing = editandoNota === nota.id;
                const prevNota = index > 0 ? grupo.notas[index - 1] : null;
                const isConsecutive = prevNota && prevNota.autor_id === nota.autor_id;

                return (
                  <div
                    key={nota.id}
                    className={`${styles.messageItem} ${isOwn ? styles.own : ''} ${isConsecutive ? styles.consecutive : ''}`}
                  >
                    <div className={`${styles.messageAvatar} ${isConsecutive ? styles.hidden : ''}`}>
                      {nota.autor?.nome?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className={styles.messageBubble}>
                      {!isConsecutive && (
                        <div className={styles.messageHeader}>
                          <span className={styles.messageAutor}>
                            {nota.autor?.nome || 'Usuario'}
                          </span>
                        </div>
                      )}

                      {isEditing ? (
                        <div className={styles.editingArea}>
                          <textarea
                            className={styles.editTextarea}
                            value={editandoConteudo}
                            onChange={(e) => setEditandoConteudo(e.target.value)}
                            autoFocus
                          />
                          <div className={styles.editActions}>
                            <button
                              className={styles.editCancelBtn}
                              onClick={handleCancelarEdicao}
                              title="Cancelar"
                            >
                              <X size={16} />
                            </button>
                            <button
                              className={styles.editSaveBtn}
                              onClick={() => handleSalvarEdicao(nota.id)}
                              title="Salvar"
                            >
                              <Check size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {nota.conteudo && (
                            <p className={styles.messageText}>
                              {renderTextWithMentions(nota.conteudo)}
                            </p>
                          )}
                        </>
                      )}

                      {nota.anexos && nota.anexos.length > 0 && (
                        <div className={styles.messageAnexos}>
                          {/* Imagens clicáveis */}
                          {nota.anexos.filter(a => isImageType(a.tipo_arquivo)).length > 0 && (
                            <div className={styles.imageGallery}>
                              {nota.anexos
                                .filter(a => isImageType(a.tipo_arquivo))
                                .map((anexo) => (
                                  <button
                                    key={anexo.id}
                                    className={styles.imageThumb}
                                    onClick={() => setImagemExpandida({ url: anexo.url, nome: anexo.nome_arquivo })}
                                    title="Clique para expandir"
                                  >
                                    <img src={anexo.url} alt={anexo.nome_arquivo} />
                                  </button>
                                ))}
                            </div>
                          )}
                          {/* Outros arquivos */}
                          {nota.anexos
                            .filter(a => !isImageType(a.tipo_arquivo))
                            .map((anexo) => (
                              <a
                                key={anexo.id}
                                href={anexo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.anexoItem}
                              >
                                {getFileIcon(anexo.tipo_arquivo)}
                                <span className={styles.anexoNome}>
                                  {anexo.nome_arquivo}
                                </span>
                                <span className={styles.anexoTamanho}>
                                  {formatFileSize(anexo.tamanho_bytes)}
                                </span>
                              </a>
                            ))}
                        </div>
                      )}

                      {!isEditing && (
                        <div className={styles.messageFooter}>
                          {nota.editada && (
                            <span className={styles.messageEditado}>editada</span>
                          )}
                          <span className={styles.messageHora}>
                            {formatMessageDate(nota.data_envio)}
                          </span>
                        </div>
                      )}

                      {/* Menu de opções */}
                      {!isEditing && (
                        <div className={styles.messageMenu}>
                          <button
                            className={styles.menuButton}
                            onClick={() => setMenuAberto(menuAberto === nota.id ? null : nota.id)}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {menuAberto === nota.id && (
                            <div className={styles.menuDropdown}>
                              <button onClick={() => handleCopiar(nota.conteudo)}>
                                <Copy size={14} />
                                Copiar
                              </button>
                              {isOwn && (
                                <>
                                  <button onClick={() => handleIniciarEdicao(nota)}>
                                    <Pencil size={14} />
                                    Editar
                                  </button>
                                  <button
                                    className={styles.menuDeleteBtn}
                                    onClick={() => handleExcluir(nota.id)}
                                  >
                                    <Trash2 size={14} />
                                    Excluir
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        {/* Preview de arquivos selecionados */}
        {arquivosSelecionados.length > 0 && (
          <div className={styles.attachmentPreview}>
            {arquivosSelecionados.map((arquivo, index) => (
              <div key={index} className={styles.attachmentItem}>
                {arquivo.preview ? (
                  <img src={arquivo.preview} alt={arquivo.file.name} className={styles.attachmentImage} />
                ) : (
                  <div className={styles.attachmentFileIcon}>
                    {getFileIcon(arquivo.file.type)}
                  </div>
                )}
                <div className={styles.attachmentInfo}>
                  <span className={styles.attachmentName}>{arquivo.file.name}</span>
                  <span className={styles.attachmentSize}>{formatFileSize(arquivo.file.size)}</span>
                </div>
                <button
                  className={styles.attachmentRemove}
                  onClick={() => handleRemoverArquivo(index)}
                  title="Remover"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.inputRow}>
          {/* Input de arquivo oculto */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleArquivoSelecionado}
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            style={{ display: 'none' }}
          />
          <button
            className={styles.attachButton}
            onClick={handleAbrirSeletorArquivo}
            title="Anexar arquivo"
          >
            <Paperclip size={20} />
          </button>
          <div className={styles.inputWrapper}>
            {/* Dropdown de menções */}
            {mostrarMencoes && usuariosFiltrados.length > 0 && (
              <div className={styles.mentionDropdown}>
                {usuariosFiltrados.slice(0, 5).map((user) => (
                  <button
                    key={user.id}
                    className={styles.mentionOption}
                    onClick={() => handleSelecionarMencao(user)}
                    type="button"
                  >
                    <span className={styles.mentionAvatar}>
                      {user.nome.charAt(0).toUpperCase()}
                    </span>
                    <div className={styles.mentionInfo}>
                      <span className={styles.mentionName}>{user.nome}</span>
                      <span className={styles.mentionEmail}>{user.email}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={mensagemInput}
              onChange={handleInputChange}
              placeholder="Digite sua mensagem... Use @ para mencionar"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && mostrarMencoes) {
                  setMostrarMencoes(false);
                  return;
                }
                if (e.key === 'Enter' && !e.shiftKey && !mostrarMencoes) {
                  e.preventDefault();
                  handleEnviarMensagem();
                }
              }}
            />
          </div>
          <button
            className={styles.sendButton}
            onClick={handleEnviarMensagem}
            disabled={(!mensagemInput.trim() && arquivosSelecionados.length === 0) || enviando}
            title="Enviar"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
      </div>

      {/* Modal de imagem expandida */}
      {imagemExpandida && (
        <div
          className={styles.imageModal}
          onClick={() => setImagemExpandida(null)}
        >
          <button
            className={styles.imageModalClose}
            onClick={() => setImagemExpandida(null)}
            title="Fechar"
          >
            <X size={24} />
          </button>
          <img
            src={imagemExpandida.url}
            alt={imagemExpandida.nome}
            className={styles.imageModalImg}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
