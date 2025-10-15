import "./TextSelectionPage.css";
import Menu from "../components/Menu";
import { useCallback, useContext } from "react";
import { db_analise, db_delete, db_save } from "../utils/requests";
import { SSEContext } from "../utils/SSEContext";

interface TextSelectionPageProps {}

const TextSelectionPage = ({}: TextSelectionPageProps) => {
  const storage = useContext(SSEContext);
  const document_list = storage.document_list[0];

  const handleAddDocument = useCallback(() => {
    const path = "F:/Projects/Lyrata/docs/big_text_2.md";
    db_save("database/add_document", { path: path });
  }, []);

  const handleDeleteDocument = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, id: number) => {
      db_delete(`database/remove_document/${id}`);
    },
    []
  );

  const handleAnaliseDocument = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, id: number) => {
      db_analise(id);
      const index = storage.documents_properties[0].findIndex(
        (el) => el.documentId === id
      );
      if (index !== -1) {
        let copy = [...storage.documents_properties[0]];
        copy[index].isAnalising = true;
        storage.documents_properties[1](copy);
      }
    },
    [storage.documents_properties]
  );

  const handleActivation = useCallback(
    (newId: number) => {
      const index = storage.document_list[0].findIndex((el) => el[0] === newId);
      if (newId >= 0 && index !== -1) {
        storage.current_document[1](storage.document_list[0][index]);
      } else if (newId === -1) handleAddDocument();
    },
    [handleAddDocument, storage.document_list, storage.current_document]
  );

  return (
    <div className="TextSelectionPage">
      {document_list ? (
        <Menu
          onItemActivate={handleActivation}
          selectionMoveType={"elemented"}
          menuPositions={
            document_list
              ? [
                  {
                    id: -2,
                    text: <h2>Выберите текст</h2>,
                  },
                  {
                    id: -1,
                    text: (
                      <div className="FlexContainer TextSelectionAddButton">
                        <>Хотите свой текст?</>
                        <div>Добавить</div>
                      </div>
                    ),
                  },
                  ...document_list.map((el) => {
                    return {
                      id: el[0],
                      text: (
                        <div className="FlexContainer">
                          {el[0] === storage.current_document[0][0] ? (
                            <b>{el[1]}</b>
                          ) : (
                            <div>{el[1]}</div>
                          )}
                          <div className="FlexContainer">
                            {!storage.documents_properties[0].find(
                              (i) => i.documentId === el[0]
                            )!.isAnalising ? (
                              <div
                                onClick={(e) => {
                                  handleAnaliseDocument(e, el[0]);
                                }}>
                                Анализировать
                              </div>
                            ) : (
                              <div>В процессе...</div>
                            )}
                            <div
                              onClick={(e) => {
                                handleDeleteDocument(e, el[0]);
                              }}>
                              Удалить
                            </div>
                          </div>
                        </div>
                      ),
                    };
                  }),
                ]
              : [
                  { id: 0, text: <h2>Выбирать не из чего</h2> },
                  {
                    id: 1,
                    text: <div onClick={handleAddDocument}>Добавить</div>,
                  },
                ]
          }></Menu>
      ) : (
        "загрузка..."
      )}
    </div>
  );
};

export default TextSelectionPage;
