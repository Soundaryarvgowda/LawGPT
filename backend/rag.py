import os
import shutil
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.llms import Ollama
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

embeddings = OllamaEmbeddings(
    model="nomic-embed-text",
    base_url=OLLAMA_HOST
)

llm = Ollama(
    model="llama3",
    base_url=OLLAMA_HOST
)

DATA_PATH = "data/pdfs"
VECTOR_STORE_PATH = "vector_store"

os.makedirs(DATA_PATH, exist_ok=True)

def ingest_pdfs():
    loader = PyPDFDirectoryLoader(DATA_PATH)
    documents = loader.load()
    if not documents:
        return {"status": "No documents found to ingest"}
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(documents)
    
    vectorstore = FAISS.from_documents(chunks, embeddings)
    vectorstore.save_local(VECTOR_STORE_PATH)
    
    return {"status": f"Successfully ingested {len(documents)} documents into {len(chunks)} chunks"}

def get_vectorstore():
    if os.path.exists(VECTOR_STORE_PATH):
        return FAISS.load_local(VECTOR_STORE_PATH, embeddings, allow_dangerous_deserialization=True)
    return None

def query_rag(query: str):
    vectorstore = get_vectorstore()
    if not vectorstore:
        return {"response": "No documents ingested yet. Please upload legal documents first.", "sources": []}
    
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
    docs = retriever.invoke(query)
    
    context_text = "\n\n---\n\n".join([doc.page_content for doc in docs])
    
    template = """
    You are an expert AI Legal Assistant named LawGPT.
    Use the following pieces of retrieved context to answer the legal question.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    Answer in a professional, clear, and comprehensive manner.
    
    Context: {context}
    
    Question: {question}
    
    Helpful Answer:
    """
    
    prompt = PromptTemplate.from_template(template)
    chain = (
        {"context": lambda x: context_text, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    response = chain.invoke(query)
    
    sources = [{"source": doc.metadata.get("source", "Unknown"), "page": doc.metadata.get("page", "Unknown")} for doc in docs]
    
    return {"response": response, "sources": sources}

def summarize_document(filename: str):
    # Retrieve docs related to filename
    vectorstore = get_vectorstore()
    if not vectorstore:
        return "No documents available to summarize."
        
    retriever = vectorstore.as_retriever(search_kwargs={"k": 10, "filter": {"source": f"{DATA_PATH}/{filename}"}})
    docs = retriever.invoke("summarize the document")
    
    if not docs:
        return "Could not retrieve document context for summarization."
        
    context_text = "\n".join([doc.page_content for doc in docs])
    
    template = """
    You are an expert AI Legal Assistant named LawGPT.
    Please provide a concise and clear summary of the following legal document chunks.
    
    Context: {context}
    
    Summary:
    """
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm | StrOutputParser()
    response = chain.invoke({"context": context_text})
    return response
